function QuantityStepper({ value, min = 1, max = 99, onChange }) {
  function decrease() {
    onChange(Math.max(min, value - 1))
  }

  function increase() {
    onChange(Math.min(max, value + 1))
  }

  return (
    <div className="qty-stepper" role="group" aria-label="Jumlah produk">
      <button type="button" className="qty-stepper__btn" onClick={decrease} disabled={value <= min} aria-label="Kurangi">
        −
      </button>
      <span className="qty-stepper__value" aria-live="polite">
        {value}
      </span>
      <button type="button" className="qty-stepper__btn" onClick={increase} disabled={value >= max} aria-label="Tambah">
        +
      </button>
    </div>
  )
}

export default QuantityStepper
