import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // continua logando no console (útil)
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: "Arial" }}>
          <h2 style={{ marginBottom: 8 }}>Ops, quebrou aqui 😅</h2>
          <p style={{ marginBottom: 8 }}>
            Erro: <b>{String(this.state.error.message || this.state.error)}</b>
          </p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12 }}>
            {String(this.state.error.stack || "")}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
