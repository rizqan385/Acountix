const StatusBadge = ({ status, text }) => {
  const getClass = () => {
    switch (status) {
      case 'success':
        return 'status-badge status-badge-success';
      case 'error':
        return 'status-badge status-badge-error';
      case 'loading':
        return 'status-badge status-badge-loading';
      default:
        return 'status-badge';
    }
  };

  return (
    <span className={getClass()}>
      <span className="status-dot"></span>
      {text}
    </span>
  );
};

export default StatusBadge;
