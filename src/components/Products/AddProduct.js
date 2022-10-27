/* 
  32. satırda fotoğraf eklemek için FileBase'i ekledim.
    npm install react-file-base64 olarak ekleniyor ama package.json'umda ( package.json 47-48.satır)
    görürsen scripts=> start kısmı farklı, normale ek olarak --legacy filan yazıyor.
    o yüzden ben npm install react-file-base64 --legacy-peer-deps olarak ekledim.
    eğer sende normal npm yüklerken hata verirse böyle denersin.
  36.satır import
  37.satır styles import
  90.satır selectedFiles:"" ekledim
  95-102 arası bende hata veriyordu. sanırım return den sonra parantez yok diyeydi. Aklında bulunsun
  eğer hata verirse diye
  132.satır selectedFiles:""
  174-175.satır <Paper><form>
  206-214 arası fotoğraf yükleme kısmı
  Return'den sonrasını direkt kopyala yapıştır yap istersen.
  Products klasörüne form için styles.js ekledim.


*/

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
//import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import FileBase from "react-file-base64";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, updateProduct } from "../../actions/productActions";
import { useSnackbar } from "react-simple-snackbar";
import { TextField, Paper } from "@material-ui/core";
import useStyles from "./styles";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: "#1976D2",
    marginLeft: 0,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: "white",
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}))(MuiDialogContent);

/*const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);*/

const AddProduct = ({ setOpen, open, currentId, setCurrentId }) => {
  const location = useLocation();
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    selectedFiles: "",
  });
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("profile")));
  const dispatch = useDispatch();

  const product = useSelector((state) => {
    return (
      console.log(state.products.products),
      currentId
        ? state.products.products.find((c) => c._id === currentId)
        : null
    );
  });
  // eslint-disable-next-line
  const [openSnackbar, closeSnackbar] = useSnackbar();

  const classes = useStyles();

  useEffect(() => {
    if (product) {
      setProductData(product);
    }
  }, [product]);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("profile")));
    // setProductData({...productData, userId: user?.result?._id})
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentId) {
      dispatch(updateProduct(currentId, productData, openSnackbar));
    } else {
      dispatch(createProduct(productData, openSnackbar));
    }
    clear();
    handleClose()
  };
  const clear = () => {
    setCurrentId(null);
    setProductData({ name: "", price: "", selectedFiles: "" });
  };

  const handleClose = () => {
    setOpen(false);
  };

  /*const inputStyle = {
    display: "block",
    padding: "1.4rem 0.75rem",
    width: "100%",
    fontSize: "0.8rem",
    lineHeight: 1.25,
    color: "#55595c",
    backgroundColor: "#fff",
    backgroundImage: "none",
    backgroundClip: "padding-box",
    borderTop: "0",
    borderRight: "0",
    borderBottom: "1px solid #eee",
    borderLeft: "0",
    borderRadius: "3px",
    transition: "all 0.25s cubic-bezier(0.4, 0, 1, 1)",
  };
*/
  return (
    <div>
      <form>
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
          fullWidth
        >
          <DialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
            style={{ paddingLeft: "20px", color: "white" }}
          >
            {currentId ? "Produkt bearbeiten" : "Neues produkt hinzufügen"}
          </DialogTitle>
          <DialogContent dividers>
            <Paper className={classes.paper}>
              <form
                autoComplete="off"
                noValidate
                className={`${classes.root} ${classes.form}`}
                onSubmit={handleSubmit}
              >
                <Typography variant="h6">
                  {currentId
                    ? "Produkt bearbeiten"
                    : "Neues produkt hinzufügen"}
                </Typography>
                <TextField
                  name="name"
                  variant="outlined"
                  label="name"
                  fullWidth
                  value={productData.name}
                  onChange={(e) =>
                    setProductData({ ...productData, name: e.target.value })
                  }
                />
                <TextField
                  name="price"
                  variant="outlined"
                  label="price"
                  fullWidth
                  value={productData.price}
                  onChange={(e) =>
                    setProductData({ ...productData, price: e.target.value })
                  }
                />
                <div className={classes.fileInput}>
                  <FileBase
                    type="file"
                    multiple={false}
                    onDone={({ base64 }) =>
                      setProductData({ ...productData, selectedFiles: base64 })
                    }
                  />
                </div>
                <Button
                  className={classes.buttonSubmit}
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  fullWidth
                >
                  Hinzufügen
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={clear}
                  fullWidth
                >
                  Klar
                </Button>
              </form>
            </Paper>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default AddProduct;
