# Contributing to Kartr

Thank you for contributing to Kartr! This guide will help you get started.

## 🚀 Quick Start

### 1. Fork and Clone
```bash
git clone https://github.com/AnantaCoder/kartr.git
cd kartr
```

### 2. Create a Branch
```bash
git checkout -b feat/your-feature-name
```

### 3. Setup Development Environment

#### Backend
```bash
cd fastapi_backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend (Bun)
```bash
cd bun_frontend
bun install
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

## 📝 Development Workflow

### Making Changes

1. **Write code** following our style guide
2. **Add tests** for new features
3. **Run tests** to ensure everything works
4. **Update documentation** as needed

### Code Style

- **Python**: Follow PEP 8
- **JavaScript/TypeScript**: Use ESLint config
- **Naming**: 
  - Functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

### Testing

#### Backend Tests
```bash
cd fastapi_backend

# Run all tests
pytest

# Run specific test file
python tests/test_features_manual.py

# Run with coverage
pytest --cov=. tests/
```

#### Manual API Testing
```bash
# Start server
uvicorn main:app --reload

# Visit Swagger docs
# http://localhost:8000/docs
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with main

### Commit Message Format
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add Groq API fallback for chat service"
git commit -m "fix: resolve Unicode encoding in test output"
git commit -m "docs: update API documentation for virtual influencers"
```

### Submit Pull Request

1. **Push your branch**
```bash
git push origin feat/your-feature-name
```

2. **Create PR** on GitHub with:
   - Clear title and description
   - Link to related issues
   - Screenshots (if UI changes)
   - Test results

3. **Wait for review**
   - Address feedback
   - Update as needed

## 📁 Project Structure

```
kartr/
├── fastapi_backend/         # Python backend
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── tests/              # Test files
│   └── utils/              # Helper functions
├── bun_frontend/           # Bun + React 19 frontend
│   ├── src/
│   │   ├── components/     # UI Components (shadcn/ui)
│   │   ├── pages/          # View Components
│   │   ├── store/          # Redux Toolkit
│   │   └── assets/         # Media and Styles
└── docs/                   # Contribution Guides & Technical Docs
```

## 🧪 Writing Tests

### Test File Naming
- Unit tests: `test_component_name.py`
- Integration: `test_integration_name.py`
- Manual: `test_name_manual.py`

### Test Structure
```python
import pytest

def test_feature_name():
    """Test description"""
    # Arrange
    expected = "result"
    
    # Act
    result = function_to_test()
    
    # Assert
    assert result == expected
```

### Async Tests
```python
import pytest

@pytest.mark.asyncio
async def test_async_feature():
    """Test async functionality"""
    result = await async_function()
    assert result is not None
```

## 📚 Documentation

### Code Comments
```python
def complex_function(param1: str, param2: int) -> dict:
    """
    Brief description.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: When invalid input
    """
```

### API Documentation
- Update OpenAPI schemas in route docstrings
- Add examples in Swagger annotations

## 🐛 Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative approaches

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional test coverage
- [ ] Performance optimizations
- [ ] Security enhancements
- [ ] Documentation improvements

### Feature Ideas
- [ ] Multi-platform social posting
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Email notifications

## 💬 Getting Help

- **Discord:** [Join our server]
- **GitHub Discussions:** Ask questions
- **Email:** support@kartr.dev

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Thank You!

Every contribution helps make Kartr better. We appreciate your time and effort!

---

**Happy Contributing!** 🚀
