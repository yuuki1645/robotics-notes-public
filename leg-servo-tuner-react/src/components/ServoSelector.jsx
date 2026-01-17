function ServoSelector({ servos, selectedServo, onChange }) {
  return (
    <>
      <label>サーボ選択</label>
      <select value={selectedServo} onChange={(e) => onChange(e.target.value)}>
        {servos.map((servo) => (
          <option key={servo.name} value={servo.name}>
            {servo.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default ServoSelector;