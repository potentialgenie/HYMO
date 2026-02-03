"use client";

import { useEffect } from 'react';

export function GTranslateWidget() {
  useEffect(() => {
    // Check if the script is already added to avoid duplicates
    if (!document.getElementById('gtranslate_script')) {
      const script = document.createElement('script');
      script.id = 'gtranslate_script';
      script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
      script.async = true;
      document.body.appendChild(script);

      // Initialize GTranslate widget - dropdown shows only en/de; GTranslate still supports 100+ languages for translation
      ;(window as unknown as { gtranslateSettings?: object }).gtranslateSettings = {
        default_language: "en",
        languages: ["en", "de"],
        wrapper_selector: ".gtranslate",
        switcher_horizontal_position: "right",
        switcher_vertical_position: "top",
        float_switcher_open_direction: "bottom",
        flag_style: "2d",
        flags_location: "https://cdn.gtranslate.net/flags/"
      };
    }
  }, []);

  return (
    <div className="gtranslate">
      <style jsx>
        {`
        .gtranslate {
          display: inline-block;
          color: black;
        }
        :global(.gt_float_switcher) {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 14px !important;
        }
        :global(.gt_selected a) {
          color: black !important;
        }
        :global(.gt_float_switcher .gt_options) {
          background-color: #151515 !important;
        }
        :global(.gt_float_switcher .gt_options a) {
          color: #fff !important;
          padding: 8px !important;
        }
        :global(.gt_float_switcher .gt-selected) {
          background-color: transparent !important;
          color: #fff !important;
        }
        :global(#gt_float_wrapper) {
          position: static !important;
        }
        :global(.gt_float_switcher .gt-selected .gt-current-lang) {
          padding: 8px !important;
          color: #fff !important;
          font-weight: bold !important;
        }
        :global(.gt_float_switcher img) {
          width: 20px !important;
          height: auto !important;
          margin: 0 5px 0px 0 !important;
          border-radius: 20px !important;
        }
        :global(.gt_float_switcher .gt-selected .gt-current-lang span.gt_float_switcher-arrow) {
          margin-left: 3px !important;
        }
      `}
      </style>
    </div>
  );
};
