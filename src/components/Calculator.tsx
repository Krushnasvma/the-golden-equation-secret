import { useState, useEffect, useCallback } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { HiddenProject } from './HiddenProject';
import { getSecureConfig } from '../config/security';

export const Calculator = () => {
  const {
    display,
    expression,
    isError,
    isHidden,
    handleNumberClick,
    handleOperatorClick,
    handleEqualsClick,
    handleClearClick,
    handleAllClearClick,
    handleDecimalClick,
    handleGoldConversion,
    handleBackClick,
    setIsHidden
  } = useCalculator();

  const [animationClass, setAnimationClass] = useState('');

  const handleButtonClick = useCallback((callback: () => void, isGold = false) => {
    callback();
    setAnimationClass(isGold ? 'gold-glow' : 'button-press');
    setTimeout(() => setAnimationClass(''), isGold ? 500 : 100);
  }, []);

  if (isHidden) {
    const config = getSecureConfig();
    return (
      <HiddenProject 
        onBack={() => setIsHidden(false)}
        projectUrl={config.projectUrl || ''}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="calc-container">
        <div className="calc-display">
          <div className="calc-expression">
            {expression || '\u00A0'}
          </div>
          <div className={`calc-result ${animationClass} ${isError ? 'error-flash' : ''}`}>
            {display}
          </div>
        </div>

        {/* Gold Karat Conversion Row */}
        <div className="calc-grid-5 mb-3">
          <button
            className="calc-gold"
            onClick={() => handleButtonClick(() => handleGoldConversion('18K'), true)}
          >
            18K
          </button>
          <button
            className="calc-gold"
            onClick={() => handleButtonClick(() => handleGoldConversion('20K'), true)}
          >
            20K
          </button>
          <button
            className="calc-gold"
            onClick={() => handleButtonClick(() => handleGoldConversion('22K'), true)}
          >
            22K
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(handleClearClick)}
          >
            C
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(handleAllClearClick)}
          >
            AC
          </button>
        </div>

        {/* Calculator Grid */}
        <div className="calc-grid gap-3">
          {/* Row 1 */}
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('7'))}
          >
            7
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('8'))}
          >
            8
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('9'))}
          >
            9
          </button>
          <button
            className="calc-operator"
            onClick={() => handleButtonClick(() => handleOperatorClick('÷'))}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('4'))}
          >
            4
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('5'))}
          >
            5
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('6'))}
          >
            6
          </button>
          <button
            className="calc-operator"
            onClick={() => handleButtonClick(() => handleOperatorClick('×'))}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('1'))}
          >
            1
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('2'))}
          >
            2
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('3'))}
          >
            3
          </button>
          <button
            className="calc-operator"
            onClick={() => handleButtonClick(() => handleOperatorClick('-'))}
          >
            -
          </button>

          {/* Row 4 */}
          <button
            className="calc-button"
            onClick={() => handleButtonClick(() => handleNumberClick('0'))}
          >
            0
          </button>
          <button
            className="calc-button"
            onClick={() => handleButtonClick(handleDecimalClick)}
          >
            .
          </button>
          <button
            className="calc-operator"
            onClick={() => handleButtonClick(handleEqualsClick)}
          >
            =
          </button>
          <button
            className="calc-operator"
            onClick={() => handleButtonClick(() => handleOperatorClick('+'))}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Calculator Watermark - Only show when not hidden */}
      {!isHidden && (
        <div className="calc-watermark">
          @developed by Krushna Soni
        </div>
      )}
    </div>
  );
};