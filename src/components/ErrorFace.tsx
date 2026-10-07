'use client';

import Link from 'next/link';

export default function ErrorFace() {
  return (
    <main className="error-page">
      <section className="error-card" aria-labelledby="error-title">
        <svg
          className="error-face"
          viewBox="0 0 320 380"
          role="img"
          aria-label="Sad error face"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="25"
          >
            <g className="face-eyes" transform="translate(0,112.5)">
              <g transform="translate(15,0)">
                <polyline
                  className="face-eye-lid"
                  points="37,0 0,120 75,120"
                ></polyline>

                <polyline
                  className="face-pupil"
                  points="55,120 55,155"
                  strokeDasharray="35 35"
                ></polyline>
              </g>

              <g transform="translate(230,0)">
                <polyline
                  className="face-eye-lid"
                  points="37,0 0,120 75,120"
                ></polyline>

                <polyline
                  className="face-pupil"
                  points="55,120 55,155"
                  strokeDasharray="35 35"
                ></polyline>
              </g>
            </g>

            <rect
              className="face-nose"
              x="132.5"
              y="112.5"
              width="55"
              height="155"
              rx="4"
              ry="4"
            ></rect>

            <g
              className="face-mouth"
              transform="translate(65,334)"
              strokeDasharray="102 102"
            >
              <path
                className="face-mouth-left"
                d="M 0 30 C 0 30 40 0 95 0"
              ></path>

              <path
                className="face-mouth-right"
                d="M 95 0 C 150 0 190 30 190 30"
              ></path>
            </g>
          </g>
        </svg>

        <div className="error-code">ERROR 404</div>

        <h1 id="error-title" className="error-title">
          Something went wrong
        </h1>

        <p className="error-description">
          The page you are looking for could not be found.
        </p>

        <div className="error-actions">
          <Link className="error-button error-button-primary" href="/">
            Go back home
          </Link>

          <Link
            className="error-button error-button-secondary"
            href="/contact"
          >
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}
