import '@testing-library/jest-dom';

// IntersectionObserver mock for jsdom
const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(() => callback([{ isIntersecting: true }])),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});
