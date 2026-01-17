function ModeSelector({ mode, onChange }) {
  return (
    <div className="mode">
      <label className="mode-item">
        <input
          type="radio"
          name="mode"
          value="logical"
          checked={mode === "logical"}
          onChange={(e) => onChange(e.target.value)}
        />
        論理角
      </label>
      <label className="mode-item">
        <input
          type="radio"
          name="mode"
          value="physical"
          checked={mode === "physical"}
          onChange={(e) => onChange(e.target.value)}
        />
        物理角
      </label>
    </div>
  );
}

export default ModeSelector;