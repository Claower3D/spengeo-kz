import os

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'a', encoding='utf-8') as f:
    f.write('''

/* ==========================================================================
   Light Theme Adaptations for CAD, Forms, and Specs 
   ========================================================================== */
:is([data-theme="white"], [data-theme="light-gray"]) .cad-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.03);
}

:is([data-theme="white"], [data-theme="light-gray"]) .cad-crosshairs {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
}

:is([data-theme="white"], [data-theme="light-gray"]) .form-input,
:is([data-theme="white"], [data-theme="light-gray"]) .form-select {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--color-text-primary);
}

:is([data-theme="white"], [data-theme="light-gray"]) .form-input:focus,
:is([data-theme="white"], [data-theme="light-gray"]) .form-select:focus {
  background: #ffffff;
  border-color: var(--color-accent);
}

:is([data-theme="white"], [data-theme="light-gray"]) .spec-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:is([data-theme="white"], [data-theme="light-gray"]) .spec-label {
  color: var(--color-text-secondary);
}

:is([data-theme="white"], [data-theme="light-gray"]) .spec-value {
  color: var(--color-text-primary);
}
''')

print("Appended Light Theme Adaptations to index.css")
