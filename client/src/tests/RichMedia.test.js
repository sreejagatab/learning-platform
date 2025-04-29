import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MathNotation from '../components/MathNotation';
import CodeExecutionEnvironment from '../components/CodeExecutionEnvironment';

// Mock functions
const mockInsert = jest.fn();

describe('MathNotation Component', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  test('renders math notation button', () => {
    render(<MathNotation onInsert={mockInsert} />);
    const mathButton = screen.getByText('Math');
    expect(mathButton).toBeInTheDocument();
  });

  test('opens dialog when button is clicked', () => {
    render(<MathNotation onInsert={mockInsert} />);
    const mathButton = screen.getByText('Math');
    fireEvent.click(mathButton);
    
    // Check if dialog is open
    const dialogTitle = screen.getByText('Insert Math Equation');
    expect(dialogTitle).toBeInTheDocument();
  });

  test('inserts inline math equation', () => {
    render(<MathNotation onInsert={mockInsert} />);
    const mathButton = screen.getByText('Math');
    fireEvent.click(mathButton);
    
    // Enter equation
    const equationInput = screen.getByLabelText('LaTeX Equation');
    fireEvent.change(equationInput, { target: { value: 'x^2 + y^2 = z^2' } });
    
    // Click insert button
    const insertButton = screen.getByText('Insert');
    fireEvent.click(insertButton);
    
    // Check if onInsert was called with correct format
    expect(mockInsert).toHaveBeenCalledWith('\\(x^2 + y^2 = z^2\\)');
  });
});

describe('CodeExecutionEnvironment Component', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  test('renders code button', () => {
    render(<CodeExecutionEnvironment onInsert={mockInsert} />);
    const codeButton = screen.getByText('Code');
    expect(codeButton).toBeInTheDocument();
  });

  test('opens dialog when button is clicked', () => {
    render(<CodeExecutionEnvironment onInsert={mockInsert} />);
    const codeButton = screen.getByText('Code');
    fireEvent.click(codeButton);
    
    // Check if dialog is open
    const dialogTitle = screen.getByText('Code Editor');
    expect(dialogTitle).toBeInTheDocument();
  });

  test('inserts code with default template', () => {
    render(<CodeExecutionEnvironment onInsert={mockInsert} />);
    const codeButton = screen.getByText('Code');
    fireEvent.click(codeButton);
    
    // Default JavaScript template should be loaded
    const codeInput = screen.getByLabelText('Code');
    expect(codeInput.value).toContain('console.log("Hello, world!")');
    
    // Click insert button
    const insertButton = screen.getByText('Insert');
    fireEvent.click(insertButton);
    
    // Check if onInsert was called with HTML containing the code
    expect(mockInsert).toHaveBeenCalled();
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg).toContain('<pre class="language-javascript">');
    expect(insertArg).toContain('console.log("Hello, world!")');
  });

  test('changes language template when language is changed', () => {
    render(<CodeExecutionEnvironment onInsert={mockInsert} />);
    const codeButton = screen.getByText('Code');
    fireEvent.click(codeButton);
    
    // Change language to Python
    const languageSelect = screen.getByLabelText('Language');
    fireEvent.change(languageSelect, { target: { value: 'python' } });
    
    // Python template should be loaded
    const codeInput = screen.getByLabelText('Code');
    expect(codeInput.value).toContain('print("Hello, world!")');
  });
});
