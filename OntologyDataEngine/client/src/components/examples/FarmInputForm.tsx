import FarmInputForm from '../FarmInputForm'

export default function FarmInputFormExample() {
  return (
    <FarmInputForm 
      onSubmit={(data) => console.log('Form submitted:', data)}
    />
  )
}
