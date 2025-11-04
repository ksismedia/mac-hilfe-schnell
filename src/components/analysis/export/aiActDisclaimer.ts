/**
 * Generates AI Act compliance disclaimer HTML for customer reports
 */
export const getAIActDisclaimerHTML = (hasUnreviewedContent: boolean = false): string => {
  if (!hasUnreviewedContent) {
    // Compliance confirmation for fully reviewed content
    return `
      <div style="background: linear-gradient(135deg, #d4f4dd 0%, #c8e6c9 100%); padding: 20px; border-radius: 12px; border: 2px solid #4caf50; margin: 30px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <svg style="width: 24px; height: 24px; color: #2e7d32; margin-right: 10px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <h3 style="margin: 0; color: #2e7d32; font-size: 18px; font-weight: 700;">
            ✓ KI-Verordnung (EU AI Act) konform
          </h3>
        </div>
        <p style="margin: 0; color: #1b5e20; font-size: 14px; line-height: 1.6;">
          Alle in diesem Report enthaltenen AI-generierten Bewertungen wurden durch qualifizierte Mitarbeiter 
          manuell überprüft und freigegeben. Die Analyse entspricht den Anforderungen der EU-Verordnung 
          (EU) 2024/1689 über künstliche Intelligenz (AI Act).
        </p>
      </div>
    `;
  }

  // Warning for unreviewed content
  return `
    <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 12px; border: 3px solid #ff9800; margin: 30px 0; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <svg style="width: 28px; height: 28px; color: #e65100; margin-right: 12px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <h3 style="margin: 0; color: #e65100; font-size: 20px; font-weight: 700;">
          ⚠️ HINWEIS: KI-Verordnung (EU AI Act)
        </h3>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <p style="margin: 0 0 12px 0; color: #d84315; font-size: 15px; font-weight: 600;">
          Dieser Report enthält AI-generierte Inhalte, die noch nicht vollständig manuell überprüft wurden.
        </p>
        <p style="margin: 0; color: #5d4037; font-size: 14px; line-height: 1.7;">
          Gemäß der EU-Verordnung (EU) 2024/1689 über künstliche Intelligenz (AI Act) müssen 
          AI-generierte Bewertungen und Empfehlungen durch menschliche Aufsicht ("Human Oversight") 
          validiert werden, bevor sie für geschäftliche Entscheidungen verwendet werden.
        </p>
      </div>
      <div style="background: #fff8e1; padding: 12px; border-left: 4px solid #ff6f00; border-radius: 4px;">
        <p style="margin: 0; color: #e65100; font-size: 13px; font-weight: 600;">
          📋 Bitte beachten: Die in diesem Report enthaltenen AI-Bewertungen dienen als 
          Ersteinschätzung und sollten durch Fachexperten überprüft werden.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generates transparency info about AI usage in the report
 */
export const getAITransparencyInfoHTML = (): string => {
  return `
    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 10px; border: 1px solid #2196f3; margin: 25px 0;">
      <h4 style="margin: 0 0 12px 0; color: #0d47a1; font-size: 16px; font-weight: 700; display: flex; align-items: center;">
        <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/>
        </svg>
        Transparenz über AI-Nutzung
      </h4>
      <div style="font-size: 13px; color: #1565c0; line-height: 1.7;">
        <p style="margin: 0 0 10px 0;">
          <strong>In dieser Analyse verwendete AI-Systeme:</strong>
        </p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Google PageSpeed Insights API (Performance-Bewertung)</li>
          <li>Google Places API (Bewertungen & lokale Präsenz)</li>
          <li>Algorithmusbasierte SEO-Analyse</li>
          <li>Automated Accessibility Testing</li>
          <li>Content-Quality Scoring</li>
        </ul>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #0277bd;">
          ℹ️ Alle AI-Bewertungen basieren auf objektiven Metriken und öffentlich verfügbaren Daten. 
          Die finale Interpretation und Handlungsempfehlungen erfolgen durch qualifizierte Berater.
        </p>
      </div>
    </div>
  `;
};
