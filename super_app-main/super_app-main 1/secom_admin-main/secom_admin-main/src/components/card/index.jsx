function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-clip-border transition-colors ${extra}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        boxShadow: '0 10px 25px var(--shadow-color)'
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
