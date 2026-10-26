const loginPageStyles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f6fa 0%, #e0e2e7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    px: 6,
    py: 5,
    maxWidth: 420,
    width: '100%',
    borderRadius: 5,
    boxShadow: '0 8px 32px 0 rgba(60,60,80,0.10)',
    bgcolor: '#f7f7fa'
  },
  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 3
  },
  avatar: {
    width: 80,
    height: 80,
    mb: 2,
    bgcolor: '#1a237e'
  },
  button: {
    mt: 3,
    height: 46,
    //background: '#1a237e',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    background: "rgb(5, 138, 131)",
    // letterSpacing: 1,
    borderRadius: 3,
    variant: "contained",
    boxShadow: 3,
    size: "small",
    //':hover': { background: '#283593' }
    ':hover': {
      backgroundColor: "rgb(1, 155, 147)",
      boxShadow: 10,
    }
  }
};

export default loginPageStyles;