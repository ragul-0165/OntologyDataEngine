import CropRecommendationCard, { type CropRecommendation } from "./CropRecommendationCard";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { Sparkles } from "lucide-react";

interface RecommendationsSectionProps {
  recommendations: CropRecommendation[];
  location: string;
}

export default function RecommendationsSection({ recommendations, location }: RecommendationsSectionProps) {
  if (recommendations.length === 0) return null;

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight() };
    const margin = { x: 40, y: 40 };
    const palette = {
      primary: '#2563eb', // blue-600
      text: '#111827',    // gray-900
      subtext: '#6b7280', // gray-500
      mutedBg: '#f3f4f6', // gray-100
      cardBorder: '#e5e7eb' // gray-200
    };

    // Header bar
    doc.setFillColor(palette.primary);
    doc.rect(0, 0, page.width, 64, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Crop Recommendations', margin.x, 40 + 6);

    // Meta
    let y = 64 + 24;
    doc.setTextColor(palette.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Location: ${location}`, margin.x, y); y += 16;
    doc.setTextColor(palette.subtext);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin.x, y); y += 18;

    const newPageIfNeeded = (heightNeeded: number) => {
      if (y + heightNeeded > page.height - margin.y) {
        doc.addPage();
        y = margin.y;
      }
    };

    const drawDivider = () => {
      doc.setDrawColor(palette.cardBorder);
      doc.setLineWidth(0.5);
      doc.line(margin.x, y, page.width - margin.x, y);
      y += 12;
    };

    drawDivider();

    recommendations.forEach((r, idx) => {
      // Card layout constants
      const cardX = margin.x;
      const cardW = page.width - margin.x * 2;
      const pad = 14;
      const innerX = cardX + pad;
      const innerW = cardW - pad * 2;

      // Ensure space for at least header + a couple lines
      newPageIfNeeded(120);

      const cardY = y;
      let cursorY = cardY + pad;

      // Card background & border (we'll redraw border after computing height)
      doc.setDrawColor(palette.cardBorder);
      doc.setFillColor('#ffffff');
      doc.roundedRect(cardX, cardY, cardW, 100, 10, 10, 'F'); // temporary height, border later

      // Title
      doc.setTextColor(palette.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const title = `${idx + 1}. ${r.name}`;
      doc.text(title, innerX, cursorY);

      // Score pill (bounded inside card)
      const pill = `${r.suitabilityScore}%`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const pillW = doc.getTextWidth(pill) + 18;
      const pillH = 20;
      const pillX = innerX + innerW - pillW; // right aligned within padding
      const pillY = cursorY - 13;
      doc.setFillColor(palette.primary);
      doc.roundedRect(pillX, pillY, pillW, pillH, 10, 10, 'F');
      doc.setTextColor('#ffffff');
      doc.text(pill, pillX + 9, pillY + 14);

      cursorY += 10;

      // Market price (full width) then metrics on next line to avoid overflow
      doc.setTextColor(palette.subtext);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const price = `Market Price: ₹${(r.marketPrice || 0).toLocaleString('en-IN')}/quintal`;
      const priceLines = doc.splitTextToSize(price, innerW);
      priceLines.forEach(line => { cursorY += 16; newPageIfNeeded(32); doc.text(line, innerX, cursorY); });

      const metrics = `Water: ${r.waterUsage}    Carbon: ${r.carbonFootprint}`;
      const metricLines = doc.splitTextToSize(metrics, innerW);
      metricLines.forEach(line => { cursorY += 14; newPageIfNeeded(28); doc.text(line, innerX, cursorY); });

      // Sections helper
      const writeWrapped = (label: string, text: string) => {
        cursorY += 16;
        newPageIfNeeded(36);
        doc.setTextColor(palette.text);
        doc.setFont('helvetica', 'bold');
        doc.text(label, innerX, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(palette.subtext);
        const lines = doc.splitTextToSize(text, innerW);
        lines.forEach((line) => {
          cursorY += 14;
          newPageIfNeeded(28);
          doc.text(line, innerX, cursorY);
        });
      };

      writeWrapped('Soil Match', r.soilMatch);
      writeWrapped('Climate Match', r.climateMatch);

      if (r.reasoning && r.reasoning.length) {
        // Render each reason; special vertical formatting for score breakdown
        cursorY += 16;
        newPageIfNeeded(36);
        doc.setTextColor(palette.text);
        doc.setFont('helvetica', 'bold');
        doc.text('Reasons', innerX, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(palette.subtext);

        r.reasoning.forEach(reason => {
          const isBreakdown = /^Score breakdown/i.test(reason);
          if (isBreakdown) {
            // Heading for breakdown
            cursorY += 14;
            newPageIfNeeded(28);
            doc.setTextColor(palette.text);
            doc.setFont('helvetica', 'bold');
            doc.text('• Score breakdown', innerX, cursorY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(palette.subtext);

            // Try to extract key: value pairs and total
            // Expected format: "Score breakdown → Soil: X, Climate: Y, Weather: Z, Sustainability: W; Total: N%"
            const afterArrow = reason.split('→')[1] || '';
            const [pairsPart, totalPartRaw] = afterArrow.split(';');
            const pairs = (pairsPart || '').split(',').map(s => s.trim()).filter(Boolean);
            const totalMatch = /Total:\s*([0-9]+)%/i.exec(totalPartRaw || '');
            const totalText = totalMatch ? `Total: ${totalMatch[1]}%` : '';

            const subItems = [...pairs, totalText].filter(Boolean);
            subItems.forEach(item => {
              const lines = doc.splitTextToSize(`   • ${item}`, innerW - 16);
              lines.forEach(line => {
                cursorY += 14;
                newPageIfNeeded(28);
                doc.text(line, innerX + 12, cursorY);
              });
            });
          } else {
            const bullet = `• ${reason}`;
            const lines = doc.splitTextToSize(bullet, innerW);
            lines.forEach(line => {
              cursorY += 14;
              newPageIfNeeded(28);
              doc.text(line, innerX, cursorY);
            });
          }
        });
      }

      // Finalize card height and draw border over background
      const cardH = (cursorY + pad) - cardY;
      doc.setDrawColor(palette.cardBorder);
      doc.roundedRect(cardX, cardY, cardW, cardH, 10, 10, 'S');

      // Advance y with spacing between cards
      y = cardY + cardH + 16;
    });

    doc.save('crop-recommendations.pdf');
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="text-3xl font-bold" data-testid="text-recommendations-title">
              Your Personalized Recommendations
            </h3>
          </div>
          <p className="text-lg text-muted-foreground">
            Based on your location: <span className="font-semibold text-foreground">{location}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Recommendations powered by agricultural ontology reasoning and real-time data
          </p>
          <div className="mt-6">
            <Button variant="default" onClick={downloadPdf} data-testid="button-download-pdf">
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((crop, index) => (
            <CropRecommendationCard key={`${crop.name}-${index}`} crop={crop} />
          ))}
        </div>
      </div>
    </section>
  );
}
