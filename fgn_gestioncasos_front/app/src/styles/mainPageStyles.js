import headerBg from '../assets/banner7.png';

const mainPageStyles = {
  root: {
    minHeight: '100vh',
    width: '100vw',
    overflowX: 'hidden',
    background: (theme) =>
      `linear-gradient(135deg, ${theme.palette.grey[200]}, ${theme.palette.grey[100]})`,
    py: 0, // sin padding vertical aquí
  },
  header: {
    width: "97vw",
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
    bgcolor: "#0a237e",
    boxShadow: "0 2px 6px 0 rgba(20,20,55,0.18)",
    minHeight: 60,
    px: 3,
    py: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
    backgroundImage: `url(${headerBg})`,
    backgroundSize: "cover", // todo el header
    backgroundPosition: "center", // centrada
  },
  inputTextmain: {
    maxWidth: 760,
    '& .MuiOutlinedInput-root': {
      borderRadius: '999px',
      backgroundColor: '#ffffff',
      color: '#003f52',
      fontSize: '0.90rem',
      boxShadow: '0 4px 20px rgba(0, 63, 82, 0.12)',
      transition: 'all .25s ease',
      '& fieldset': { borderColor: 'rgba(0, 63, 82, 0.25)' },
      '&:hover fieldset': { borderColor: 'rgba(0, 63, 82, 0.55)' },
      '&.Mui-focused': {
        boxShadow: '0 0 0 5px rgba(0, 120, 160, 0.18), 0 8px 30px rgba(0, 63, 82, 0.18)',
      },
      '&.Mui-focused fieldset': { borderColor: '#0078a0', borderWidth: 1.5 },
    },
    '& .MuiInputBase-input': { py: 1.8, px: 3 },
    '& .MuiInputBase-input::placeholder': {
      color: 'rgba(0, 63, 82, 0.6)',
      opacity: 1,
    }
  },
  logoutButton: {
    variant: "contained",
    color: "#fff",
    size: "small",
    px: 1.5,
    py: 0.5,
    //fontWeight: "bold",
    borderRadius: 3,
    boxShadow: 3,
    textTransform: "none",
    fontSize: "0.9rem",
    background: "rgb(5, 138, 131)",
    letterSpacing: 0.2,
    ml: "auto",
    ':hover': {
      backgroundColor: "rgb(1, 155, 147)",
      boxShadow: 10,
    }
  },
  videoStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    border: 0,
    zIndex: 0,
    pointerEvents: 'none'
  }
};


export default mainPageStyles;