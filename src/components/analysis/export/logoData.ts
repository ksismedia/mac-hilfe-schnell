// Text-based logo for HTML exports
export const getLogoHTML = () => {
  console.log('getLogoHTML called'); // Debug log
  
  const logoHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 145px; height: 140px; padding: 20px 5px 20px 35px; background: #1a1a1a; border-radius: 8px; border: 3px solid #f4c430; display: inline-flex; flex-direction: column; justify-content: center; align-items: flex-end;">
        <div style="width: 30px; height: 30px; margin-bottom: 5px; margin-right: 2px;">
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; fill: none; stroke: #f4c430; stroke-width: 4;">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
          </svg>
        </div>
        <div style="font-family: 'Arial Narrow', 'Helvetica Condensed', Arial; font-size: 21px; font-weight: 600; text-align: right; text-transform: uppercase; line-height: 0.8; margin-bottom: 1px; color: #f4c430; font-stretch: ultra-condensed;">HANDWERK</div>
        <div style="font-family: 'Arial Narrow', 'Helvetica Condensed', Arial; font-size: 21px; font-weight: 600; text-align: right; text-transform: uppercase; line-height: 0.8; color: #f4c430; font-stretch: ultra-condensed;">STARS</div>
      </div>
    </div>
  `;
  
  console.log('Logo HTML generated:', logoHTML); // Debug log
  return logoHTML;
};