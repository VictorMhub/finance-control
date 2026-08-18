import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { GoalsClient } from '@/components/goals/GoalsClient';

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('GoalsClient', () => {
  it('renders goal progress, difficulty and months remaining', () => {
    renderWithChakra(
      <GoalsClient
        monthlyIncome={5000}
        initialGoals={[
          {
            id: 'goal1',
            title: 'Reserva de Emergência',
            targetAmount: 10000,
            savedAmount: 2500,
            monthlyContribution: 500,
            difficulty: 'EASY'
          }
        ]}
      />
    );

    expect(screen.getByText('Reserva de Emergência')).toBeInTheDocument();
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.getByText(/25% concluído/)).toBeInTheDocument();
    expect(screen.getByText(/15 meses restantes/)).toBeInTheDocument();
  });
});
