import React, { useState, useEffect, useRef } from "react";
import styles from "./Invoice.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { toCommas } from "../../utils/utils";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineRoundedIcon from "@material-ui/icons/DeleteOutlineRounded";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { Container, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import SaveIcon from "@material-ui/icons/Save";
import Button from "@material-ui/core/Button";
import { initialState } from "../../initialState";
import currencies from "../../cities_of_turkey.json";
import {
  createInvoice,
  getInvoice,
  updateInvoice,
} from "../../actions/invoiceActions";
import { getClientsByUser } from "../../actions/clientActions";
import AddClient from "./AddClient";
import InvoiceType from "./InvoiceType";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { getProduct } from "../../actions/productActions";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
//import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  table: {
    minWidth: 650,
  },

  headerContainer: {
    // display: 'flex'
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(1),
  },
}));

const Invoice = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(initialState);
  const [currency, setCurrency] = useState(currencies[0].value);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.getTime() + 7 * 24 * 60 * 60 * 1000
  );
  const [client, setClient] = useState(null);
  const [type, setType] = useState("Invoice");
  const [status, setStatus] = useState("");
  const { id } = useParams();
  const clients = useSelector((state) => state.clients.clients);
  const products = useSelector((state) => state.products.products);
  const { invoice } = useSelector((state) => state.invoices);
  const dispatch = useDispatch();
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem("profile"));
  //buradaki birimler degistirilecek
  const [units, setUnits] = useState(["QM", "Stück", "km", "litre"]);
  const [taxes, setTaxes] = useState(["ust 19", "ust 7", "%18", "keine"]);
  const [taxValues, setTaxValues] = useState([19, 7, 18, 0]);

  const [enteredUnit, setEnteredUnit] = useState("");

  useEffect(() => {
    getTotalCount();
  }, [location]);

  const getTotalCount = async () => {
    try {
      const response = await axios.get(
        `https://invoice-compiler.herokuapp.com/invoices/count?searchQuery=${user?.result?._id}`
      );
      //   console.log(response.data);
      //Get total count of invoice from the server and increment by one to serialized numbering of invoice
      setInvoiceData({
        ...invoiceData,
        invoiceNumber: (Number(response.data) + 1).toString().padStart(3, "0"),
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(getInvoice(id));
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    dispatch(getProduct());
    // eslint-disable-next-line
  }, [invoice]);

  useEffect(() => {
    dispatch(
      getClientsByUser({ search: user?.result._id || user?.result?.googleId })
    );
    dispatch(getProduct());
    // eslint-disable-next-line
  }, [dispatch]);

  useEffect(() => {
    if (invoice) {
      //Automatically set the default invoice values as the ones in the invoice to be updated
      setInvoiceData(invoice);
      //setRates(invoice.rates);
      setClient(invoice.client);
      setType(invoice.type);
      setStatus(invoice.status);
      setSelectedDate(invoice.dueDate);
    }
  }, [invoice]);

  useEffect(() => {
    if (type === "Receipt") {
      setStatus("Paid");
    } else {
      setStatus("Unpaid");
    }
  }, [type]);

  const defaultProps = {
    options: currencies,
    getOptionLabel: (option) => option.label,
  };

  const clientsProps = {
    options: clients,
    getOptionLabel: (option) => option.name,
  };

  const itemsProps = {
    options: products,
    getOptionLabel: (option) => option.name,
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  /*const handleRates = (e) => {
    setRates(e.target.value);
    setInvoiceData((prevState) => ({ ...prevState, tax: e.target.value }));
  };*/

  const handleChange = (index, e) => {
    const values = [...invoiceData.items];
    values[index][e.target.name] = e.target.value;
    setInvoiceData({ ...invoiceData, items: values });
  };

  const inputChange = (e, newInputValue, index) => {
    const values = [...invoiceData.items];

    values[index]["itemName"] = newInputValue;
    const inputProduct = products.find((obj) => {
      return obj.name === newInputValue;
    });

    if (inputProduct !== undefined) {
      values[index]["unitPrice"] = inputProduct.price;
      values[index]["selectedFiles"] = inputProduct.selectedFiles;
    }
    setInvoiceData({ ...invoiceData, items: values });
  };

  useEffect(() => {
    //Get the subtotal
    const subTotal = () => {
      var arr = document.getElementsByName("amount");
      var subtotal = 0;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].value) {
          subtotal += +arr[i].value;
        }
        // document.getElementById("subtotal").value = subtotal;
        setSubTotal(subtotal);
      }
    };

    subTotal();
  }, [invoiceData]);

  useEffect(() => {
    const total = () => {
      //Tax rate is calculated as (input / 100 ) * subtotal + subtotal
      //const overallSum = (rates / 100) * subTotal + subTotal;
      //kdv is calculated as tax rates /100 * subtotal
      setTotal(subTotal);
    };
    total();
  }, [invoiceData, subTotal]);

  const handleAddField = (e) => {
    e.preventDefault();
    setInvoiceData((prevState) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          itemName: "",
          selectedFiles: "",
          unitPrice: "",
          quantity: "",
          unit: "",
          discount: "",
          amount: "",
        },
      ],
    }));
  };

  const handleRemoveField = (index) => {
    const values = invoiceData.items;
    values.splice(index, 1);
    setInvoiceData((prevState) => ({ ...prevState, values }));
  };
  console.log(invoiceData);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (invoice) {
      dispatch(
        updateInvoice(invoice._id, {
          ...invoiceData,
          subTotal: subTotal,
          total: total,
          currency: currency,
          dueDate: selectedDate,
          client,
          type: type,
          status: status,
        })
      );
      history.push(`/invoice/${invoice._id}`);
    } else {
      dispatch(
        createInvoice(
          {
            ...invoiceData,
            subTotal: subTotal,
            total: total,
            currency: currency,
            dueDate: selectedDate,
            invoiceNumber: `${
              invoiceData.invoiceNumber < 100
                ? Number(invoiceData.invoiceNumber).toString().padStart(3, "0")
                : Number(invoiceData.invoiceNumber)
            }`,
            client,
            type: type,
            status: status,
            paymentRecords: [],
            creator: [user?.result?._id || user?.result?.googleId],
          },
          history
        )
      );
    }

    // setInvoiceData(initialState)
  };

  //Tax functions
  const [openTax, setOpenTax] = React.useState(false);
  const [enteredTax, setEnteredTax] = useState("");
  const [enteredTaxValue, setEnteredTaxValue] = useState();

  const taxOnChange = (index, event) => {
    const taxValue = taxValues[event.target.value];
    const values = [...invoiceData.items];
    values[index]["rates"] = taxValue;
    setInvoiceData({ ...invoiceData, items: values });
  };
  const handleTaxClickOpen = () => {
    setOpenTax(true);
  };
  const handleTaxClose = () => {
    setOpenTax(false);
  };
  const addTax = () => {
    setTaxes([...taxes, enteredTax]);
    setTaxValues([...taxValues, enteredTaxValue]);
    setOpenTax(false);
  };
  const addTaxChangeHandler = (event) => {
    setEnteredTax(event.target.value);
  };
  const addTaxValueChangeHandler = (event) => {
    setEnteredTaxValue(event.target.value);
  };

  //Unit functions
  const unitOnChange = (index, event) => {
    const values = [...invoiceData.items];
    values[index]["unit"] = event.target.value;
    setInvoiceData({ ...invoiceData, items: values });
  };
  const [openUnit, setOpenUnit] = React.useState(false);

  const handleClickOpen = () => {
    setOpenUnit(true);
  };

  const handleClose = () => {
    setOpenUnit(false);
  };

  const addUnit = () => {
    setUnits([...units, enteredUnit]);
    setOpenUnit(false);
  };

  const addUnitChangeHandler = (event) => {
    setEnteredUnit(event.target.value);
  };

  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const CustomPaper = (props) => {
    return <Paper elekdvion={3} {...props} />;
  };

  const ItemPaper = (props) => {
    return <Paper elekdvion={3} {...props} />;
  };

  if (!user) {
    history.push("/login");
  }

  return (
    <div className={styles.invoiceLayout}>
      <form onSubmit={handleSubmit} className="mu-form">
        <AddClient setOpen={setOpen} open={open} />
        <Container className={classes.headerContainer}>
          <Grid container justifyContent="space-between">
            <Grid item>
              {/* <Akdvar alt="Logo" variant='square' src="" className={classes.large} /> */}
            </Grid>
            <Grid item>
              <InvoiceType type={type} setType={setType} />
              Rechnung #:
              <div
                style={{
                  marginTop: "15px",
                  width: "100px",
                  padding: "8px",
                  display: "inline-block",
                  backgroundColor: "#f4f4f4",
                  outline: "0px solid transparent",
                }}
                contenteditable="true"
                onInput={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.currentTarget.textContent,
                  })
                }
              >
                <span
                  style={{ width: "40px", color: "black", padding: "15px" }}
                  contenteditable="false"
                >
                  {" "}
                  {invoiceData.invoiceNumber}
                </span>
                <br />
              </div>
            </Grid>
          </Grid>
        </Container>
        <Divider />
        <Container>
          <Grid
            container
            justifyContent="space-between"
            style={{ marginTop: "40px" }}
          >
            <Grid item style={{ width: "50%" }}>
              <Container>
                <Typography
                  variant="overline"
                  style={{
                    color: "gray",
                    paddingRight: "3px",
                    fontSize: "17px",
                  }}
                  gutterBottom
                >
                  Empfänger
                </Typography>

                {client && (
                  <>
                    <Typography
                      variant="subtitle2"
                      style={{
                        fontSize: "20px",
                        marginBottom: "5px",
                      }}
                      gutterBottom
                    >
                      {client.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{
                        fontSize: "17px",
                        marginBottom: "5px",
                      }}
                    >
                      {client.email}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{
                        fontSize: "17px",
                        marginBottom: "5px",
                      }}
                    >
                      {client.phone}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{
                        fontSize: "17px",
                      }}
                    >
                      {client.address}
                    </Typography>

                    <Button
                      color="primary"
                      onClick={() => setClient(null)}
                      variant="outlined"
                      size="lg"
                      active
                    >
                      Veränderung
                    </Button>
                  </>
                )}
                <div
                  style={client ? { display: "none" } : { display: "block" }}
                >
                  <Autocomplete
                    {...clientsProps}
                    PaperComponent={CustomPaper}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={!invoice && true}
                        label="Wählen sie kunde aus"
                        margin="normal"
                        variant="outlined"
                      />
                    )}
                    value={clients?.name}
                    onChange={(event, value) => setClient(value)}
                  />
                </div>
                {!client && (
                  <>
                    <div className={styles.addButton}>
                      <Button
                        className={styles.buttonn}
                        color="primary"
                        onClick={() => setOpen(true)}
                        variant="contained"
                        size="lg"
                        active
                      >
                        Kunde hinzufügen
                      </Button>
                    </div>
                  </>
                )}
              </Container>
            </Grid>

            <Grid item style={{ marginRight: 20, textAlign: "right" }}>
              <Typography
                variant="overline"
                style={{ fontSize: "15px", color: "gray" }}
                gutterBottom
              >
                Status
              </Typography>
              <Typography
                variant="h6"
                gutterBottom
                style={{ color: type === "Receipt" ? "green" : "red" }}
              >
                {type === "Receipt" ? "Paid" : "Unpaid"}
              </Typography>
              <Typography
                variant="overline"
                style={{ fontSize: "15px", color: "gray" }}
                gutterBottom
              >
                Datum
              </Typography>
              <Typography
                variant="body2"
                style={{ fontSize: "20px" }}
                gutterBottom
              >
                {moment().format("MMM Do YYYY")}
              </Typography>
              <Typography
                variant="overline"
                style={{ fontSize: "15px", color: "gray" }}
                gutterBottom
              >
                Datum Des Endes
              </Typography>
              <Typography
                variant="body2"
                style={{ fontSize: "20px" }}
                gutterBottom
              >
                {selectedDate
                  ? moment(selectedDate).format("MMM Do YYYY")
                  : "27th Sep 2021"}
              </Typography>
              <Typography
                variant="overline"
                style={{ fontSize: "15px", color: "gray" }}
                gutterBottom
              >
                Gesamtsumme
              </Typography>
              <Typography
                variant="body2"
                style={{ fontSize: "20px" }}
                gutterBottom
              >
                {currency} {toCommas(total)}
              </Typography>
            </Grid>
          </Grid>
        </Container>

        <div>
          <TableContainer component={Paper} className="tb-container">
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Pos</TableCell>
                  <TableCell>Produkt Name</TableCell>
                  <TableCell>Produkt Foto</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Steuer</TableCell>
                  <TableCell>Preis</TableCell>
                  <TableCell>Rabatt(%)</TableCell>
                  <TableCell>Gesamtmenge</TableCell>
                  <TableCell>Produkt löschen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items.map((itemField, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell scope="row" style={{ width: "40%" }}>
                      {/*<InputBase style={{width: '100%'}} outline="none" sx={{ ml: 1, flex: 1 }} type="text" name="itemName" onChange={e => handleChange(index, e)} value={itemField.itemName} placeholder="Item name or description" />*/}
                      <Autocomplete
                        name="itemName"
                        {...itemsProps}
                        PaperComponent={ItemPaper}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required={!invoice && true}
                            label="Produktpunkt wählen"
                            margin="normal"
                            variant="outlined"
                            style={{ width: 150 }}
                          />
                        )}
                        //value={itemField.itemName}
                        //onChange={e => handleChange(index, e)}
                        onInputChange={(e, newInputValue) =>
                          inputChange(e, newInputValue, index)
                        }
                        freeSolo
                        //Listede olmayan bir şeyin yazılmasını istiyorsan yukarıdaki kodu yorum satırından çıkar
                      />
                    </TableCell>
                    <TableCell align="right" width="150" height="100">
                      <img
                        src={
                          itemField.selectedFiles ||
                          "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png"
                        }
                        alt=""
                        width="150"
                        height="100"
                        onChange={(e) => handleChange(index, e)}
                        value={itemField.selectedFiles}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        type="number"
                        name="quantity"
                        onChange={(e) => handleChange(index, e)}
                        value={itemField.quantity}
                        placeholder="0"
                        textAlign="center"
                        align="center"
                      />{" "}
                    </TableCell>
                    <TableCell>
                      {" "}
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="demo-select-small">Einheit</InputLabel>
                        <Select
                          labelId="demo-select-small"
                          id="demo-select-small"
                          label="Einheit"
                          onChange={(e) => unitOnChange(index, e)}
                        >
                          {units.map((unit, index) => (
                            <MenuItem value={unit} id={index}>
                              {unit}
                            </MenuItem>
                          ))}
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleClickOpen}
                          >
                            Hinzufügen
                          </Button>
                        </Select>
                      </FormControl>
                      <Dialog open={openUnit} onClose={handleClose}>
                        <DialogTitle>Hinzufügen</DialogTitle>
                        <DialogContent>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="einheit"
                            label="Einheit"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={addUnitChangeHandler}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleClose}>Abbrechen</Button>
                          <Button onClick={addUnit}>Hinzufügen Einheit</Button>
                        </DialogActions>
                      </Dialog>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="demo-select-small">Steuer</InputLabel>
                        <Select
                          labelId="demo-select-small"
                          id="demo-select-small"
                          label="steuer"
                          onChange={(e) => taxOnChange(index, e)}
                        >
                          {taxes.map((tax, index) => (
                            <MenuItem value={index}>{tax}</MenuItem>
                          ))}
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleTaxClickOpen}
                          >
                            Hinzufügen
                          </Button>
                        </Select>
                      </FormControl>
                      <Dialog open={openTax} onClose={handleTaxClose}>
                        <DialogTitle>Hinzufügen</DialogTitle>
                        <DialogContent>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="tax"
                            label="Steuer"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={addTaxChangeHandler}
                          />
                          <TextField
                            autoFocus
                            margin="dense"
                            id="tax_value"
                            label="Steuerwert"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={addTaxValueChangeHandler}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleTaxClose}>Abbrechen</Button>
                          <Button onClick={addTax}>Hinzufügen Steuer</Button>
                        </DialogActions>
                      </Dialog>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        type="number"
                        name="unitPrice"
                        onChange={(e) => handleChange(index, e)}
                        value={itemField.unitPrice}
                        placeholder="0"
                      />{" "}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        type="number"
                        name="discount"
                        onChange={(e) => handleChange(index, e)}
                        value={itemField.discount}
                        placeholder="0"
                      />{" "}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        type="number"
                        name="amount"
                        onChange={(e) => handleChange(index, e)}
                        value={
                          (itemField.quantity * itemField.unitPrice -
                            (itemField.quantity *
                              itemField.unitPrice *
                              itemField.discount) /
                              100) *
                            (itemField.rates / 100) +
                          (itemField.quantity * itemField.unitPrice -
                            (itemField.quantity *
                              itemField.unitPrice *
                              itemField.discount) /
                              100)
                        }
                        disabled
                      />{" "}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleRemoveField(index)}>
                        <DeleteOutlineRoundedIcon
                          style={{ width: "20px", height: "20px" }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className={styles.addButton}>
            <Button
              className={styles.buttonn}
              color="primary"
              onClick={handleAddField}
              variant="contained"
              size="lg"
              active
            >
              Produkt hinzufügen
            </Button>
          </div>
        </div>

        <div className={styles.invoiceSummary}>
          <div className={styles.summary}>Rechnung / Zusammenfassung</div>
          <div className={styles.summaryItem}>
            <p>Zwischensumme: </p>
            <h4>{subTotal}</h4>
          </div>
          <div className={styles.summaryItem}>
            <p>Gesamt: </p>
            <h4 style={{ color: "black", fontSize: "18px", lineHeight: "8px" }}>
              {currency} {toCommas(total)}
            </h4>
          </div>
        </div>

        <div className={styles.toolBar}>
          <Container>
            <Grid container>
              <Grid item style={{ marginTop: "16px", marginRight: 10 }}></Grid>
              <Grid item style={{ marginRight: 10 }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    label="Datum Des Endes"
                    format="MM/dd/yyyy"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>
          </Container>
        </div>
        <div className={styles.note}>
          <h4>Hinweis/Zahlungs Informationen</h4>
          <textarea
            style={{ border: "solid 1px #d6d6d6", padding: "10px" }}
            placeholder="Es ist ein anmerkungsbereich."
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, notes: e.target.value })
            }
            value={invoiceData.notes}
          />
        </div>

        {/* <button className={styles.submitButton} type="submit">Save and continue</button> */}
        <Grid container justifyContent="center">
          <Button
            variant="contained"
            style={{ justifyContentContent: "center" }}
            type="submit"
            color="primary"
            size="large"
            className={classes.button}
            startIcon={<SaveIcon />}
          >
            Speichern und fortfahren
          </Button>
        </Grid>
      </form>
    </div>
  );
};

export default Invoice;
