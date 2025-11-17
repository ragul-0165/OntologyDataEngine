import MarketPricesTable from '../MarketPricesTable'

export default function MarketPricesTableExample() {
  const mockPrices = [
    { state: "Kerala", district: "Ernakulam", commodity: "Banana", minPrice: 4800, maxPrice: 5000, modalPrice: 4900, date: "05/11/2025" },
    { state: "Gujarat", district: "Surat", commodity: "Cotton", minPrice: 7000, maxPrice: 7100, modalPrice: 7050, date: "05/11/2025" },
    { state: "Punjab", district: "Hoshiarpur", commodity: "Potato", minPrice: 1000, maxPrice: 1200, modalPrice: 1100, date: "05/11/2025" },
    { state: "Haryana", district: "Gurgaon", commodity: "Tomato", minPrice: 1000, maxPrice: 2000, modalPrice: 1500, date: "05/11/2025" },
    { state: "Rajasthan", district: "Ganganagar", commodity: "Onion", minPrice: 1300, maxPrice: 1700, modalPrice: 1500, date: "05/11/2025" },
  ];

  return <MarketPricesTable prices={mockPrices} />
}
