import { useState, useCallback } from 'react';
import { getSecureConfig } from '../config/security';

interface CalculatorState {
  display: string;
  expression: string;
  previousValue: string;
  operation: string;
  waitingForNumber: boolean;
  isError: boolean;
  isHidden: boolean;
  triggerSequence: string;
}

const initialState: CalculatorState = {
  display: '0',
  expression: '',
  previousValue: '',
  operation: '',
  waitingForNumber: false,
  isError: false,
  isHidden: false,
  triggerSequence: ''
};

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>(initialState);

  const resetCalculator = useCallback(() => {
    setState(initialState);
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setState(prev => ({
      ...prev,
      display: errorMessage,
      isError: true,
      expression: ''
    }));
  }, []);

  const checkTriggerSequence = useCallback((newSequence: string) => {
    const config = getSecureConfig();
    if (newSequence === config.triggerSequence) {
      // Check if we're online
      if (!navigator.onLine) {
        setError('/ERROR');
        return;
      }
      
      // Check if project URL is reachable
      fetch(config.projectUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      .then(() => {
        setState(prev => ({ ...prev, isHidden: true }));
      })
      .catch(() => {
        setError('ERROR//');
      });
    }
  }, [setError]);

  const handleNumberClick = useCallback((number: string) => {
    setState(prev => {
      if (prev.isError) return prev;
      
      const newTriggerSequence = prev.triggerSequence + number;
      
      if (prev.waitingForNumber) {
        const newDisplay = number;
        const newExpression = prev.expression + number;
        return {
          ...prev,
          display: newDisplay,
          expression: newExpression,
          waitingForNumber: false,
          triggerSequence: newTriggerSequence
        };
      } else {
        const newDisplay = prev.display === '0' ? number : prev.display + number;
        const newExpression = prev.expression + number;
        return {
          ...prev,
          display: newDisplay,
          expression: newExpression,
          triggerSequence: newTriggerSequence
        };
      }
    });
  }, []);

  const handleOperatorClick = useCallback((operator: string) => {
    setState(prev => {
      if (prev.isError) return prev;
      
      const newTriggerSequence = prev.triggerSequence + operator;
      
      if (prev.operation && !prev.waitingForNumber) {
        try {
          const result = calculate(prev.previousValue, prev.display, prev.operation);
          const newExpression = prev.expression + operator;
          
          return {
            ...prev,
            display: result.toString(),
            expression: newExpression,
            previousValue: result.toString(),
            operation: operator,
            waitingForNumber: true,
            triggerSequence: newTriggerSequence
          };
        } catch (error) {
          // Handle division by zero or other calculation errors
          return {
            ...prev,
            display: 'Error',
            expression: '',
            operation: '',
            previousValue: '',
            waitingForNumber: false,
            isError: true,
            triggerSequence: ''
          };
        }
      } else {
        const newExpression = prev.expression + operator;
        return {
          ...prev,
          previousValue: prev.display,
          operation: operator,
          expression: newExpression,
          waitingForNumber: true,
          triggerSequence: newTriggerSequence
        };
      }
    });
  }, []);

  const handleEqualsClick = useCallback(() => {
    setState(prev => {
      if (prev.isError) return prev;
      
      const newTriggerSequence = prev.triggerSequence + '=';
      
      if (prev.operation && prev.previousValue) {
        try {
          const result = calculate(prev.previousValue, prev.display, prev.operation);
          
          // Check trigger sequence after calculation
          setTimeout(() => checkTriggerSequence(newTriggerSequence), 0);
          
          return {
            ...prev,
            display: result.toString(),
            expression: prev.expression + '=' + result.toString(),
            operation: '',
            previousValue: '',
            waitingForNumber: false,
            triggerSequence: newTriggerSequence
          };
        } catch (error) {
          // For division by zero in the trigger sequence, we need special handling
          const config = getSecureConfig();
          if (newTriggerSequence === config.triggerSequence) {
            // Check trigger sequence even when calculation fails
            setTimeout(() => checkTriggerSequence(newTriggerSequence), 0);
            
            return {
              ...prev,
              display: 'Error',
              expression: prev.expression + '=Error',
              operation: '',
              previousValue: '',
              waitingForNumber: false,
              triggerSequence: newTriggerSequence
            };
          }
          
          // Handle other calculation errors
          return {
            ...prev,
            display: 'Error',
            expression: '',
            operation: '',
            previousValue: '',
            waitingForNumber: false,
            isError: true,
            triggerSequence: ''
          };
        }
      }
      
      return {
        ...prev,
        triggerSequence: newTriggerSequence
      };
    });
  }, [checkTriggerSequence]);

  const handleClearClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0',
      expression: '',
      triggerSequence: ''
    }));
  }, []);

  const handleAllClearClick = useCallback(() => {
    setState(prev => ({
      ...initialState,
      isHidden: prev.isHidden
    }));
  }, []);

  const handleDecimalClick = useCallback(() => {
    setState(prev => {
      if (prev.isError) return prev;
      
      if (prev.display.includes('.')) return prev;
      
      const newDisplay = prev.display + '.';
      const newExpression = prev.expression + '.';
      
      return {
        ...prev,
        display: newDisplay,
        expression: newExpression
      };
    });
  }, []);

  const handleGoldConversion = useCallback((karat: string) => {
    setState(prev => {
      if (prev.isError) return prev;
      
      const value = parseFloat(prev.display);
      if (isNaN(value)) return prev;
      
      let purity: number;
      switch (karat) {
        case '18K':
          purity = 0.75;
          break;
        case '20K':
          purity = 0.8333;
          break;
        case '22K':
          purity = 0.9167;
          break;
        default:
          return prev;
      }
      
      const result = value * purity;
      const formattedResult = parseFloat(result.toFixed(4)).toString();
      
      return {
        ...prev,
        display: formattedResult,
        expression: `${prev.display}×${karat}=${formattedResult}`,
        operation: '',
        previousValue: '',
        waitingForNumber: false,
        triggerSequence: ''
      };
    });
  }, []);

  const handleBackClick = useCallback(() => {
    setState(prev => ({ ...prev, isHidden: false }));
  }, []);

  const setIsHidden = useCallback((hidden: boolean) => {
    setState(prev => ({ ...prev, isHidden: hidden }));
  }, []);

  return {
    display: state.display,
    expression: state.expression,
    isError: state.isError,
    isHidden: state.isHidden,
    handleNumberClick,
    handleOperatorClick,
    handleEqualsClick,
    handleClearClick,
    handleAllClearClick,
    handleDecimalClick,
    handleGoldConversion,
    handleBackClick,
    setIsHidden
  };
};

// Helper function to perform calculations
const calculate = (a: string, b: string, operation: string): number => {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  
  switch (operation) {
    case '+':
      return numA + numB;
    case '-':
      return numA - numB;
    case '×':
      return numA * numB;
    case '÷':
      if (numB === 0) {
        throw new Error('Division by zero');
      }
      return numA / numB;
    default:
      return numB;
  }
};