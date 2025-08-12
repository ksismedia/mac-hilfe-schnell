// Text-based logo for HTML exports
export const getLogoHTML = () => {
  console.log('getLogoHTML called'); // Debug log
  
  const logoHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 150px; height: 150px; padding: 25px; background: #1a1a1a; border-radius: 8px; border: 3px solid #f4c430; display: inline-flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="width: 60px; height: 60px;">
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; fill: none; stroke: #f4c430; stroke-width: 4;">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
          </svg>
        </div>
      </div>
    </div>
  `;
  
  console.log('Logo HTML generated:', logoHTML); // Debug log
  return logoHTML;
};