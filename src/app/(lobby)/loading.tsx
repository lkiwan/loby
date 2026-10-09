
export default function Loading() {
  return (
    <div id="game-loading" className="game-loading" role="status" aria-live="polite">
      <img className="game-loading__logo" src="/icons/image.png" alt="PlayM3ana logo" />
      <div className="pencil-loader" aria-hidden="true">
        <div className="pencil-loader__pencil" />
        <div className="pencil-loader__stroke" />
      </div>
      <div className="game-loading__name">PLAYM3ANA</div>
      <div className="game-loading__message">جاري التحميل...</div>
    </div>
  );
}

