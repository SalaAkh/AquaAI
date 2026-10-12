# Contributing to AquaAI 💧

Thank you for your interest in contributing to **AquaAI**! Our goal is to combat agricultural water waste in Kazakhstan and the Aral Sea basin through science-backed agronomic intelligence and transparent verification.

## Code of Conduct
We are committed to providing a welcoming, collaborative, and inclusive environment. Please treat all participants with respect and professional courtesy.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/AquaAI.git
   cd AquaAI
   ```
3. **Install dependencies**:
   ```bash
   cd aqua-app
   npm install
   ```
4. **Run hydrology tests**:
   ```bash
   npm test
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

- **Hydrological Rigor**: All water balance calculations must adhere strictly to FAO-56 Penman-Monteith methodology ($ET_c = ET_0 \times K_c$). Do not modify unit conversion formulas ($1\text{ mm} \times 1\text{ ha} = 10\text{ m}^3$) without verifiable agronomic justification.
- **TypeScript & Type Safety**: Ensure all new types are declared in `aqua-app/src/lib/types.ts`.
- **Styling**: AquaAI uses a modern glassmorphic climate-tech design system with Tailwind CSS. Follow established card patterns (`card-glass`, `card-glass-hover`).
- **Tests**: Add unit tests for any new calculation models in `aqua-app/tests/`.

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-new-feature`
2. Commit changes with conventional commits (`feat: ...`, `fix: ...`, `docs: ...`)
3. Ensure all tests pass: `npm test`
4. Submit your Pull Request against the `main` branch with a clear description of the problem and solution.
