import React, { useState, useEffect, useRef } from "react";
// import "../../../node_modules/react-progress-button/react-progress-button.css"
import { useSnackbar } from "react-simple-snackbar";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initialState } from "../../initialState";
import { getInvoice } from "../../actions/invoiceActions";
import { toCommas } from "../../utils/utils";
import styles from "./InvoiceDetails.module.css";
import moment from "moment";
import { useHistory } from "react-router-dom";
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
import BorderColorIcon from "@material-ui/icons/BorderColor";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import Spinner from "../Spinner/Spinner";
import { useReactToPrint } from "react-to-print";
import ProgressButton from "react-progress-button";
import axios from "axios";
import { saveAs } from "file-saver";
import Modal from "../Payments/Modal";
import PaymentHistory from "./PaymentHistory";
import PdfFile from "./PdfFile";
import logo from "../../photos/logo.png";
import footer from "../../photos/footer.jpg";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import styled from "styled-components";
//import { PDFDownloadLink } from "@react-pdf/renderer";

const TableControl = styled.table`
  border: 1px solid black;
  & th {
    border: 1px solid black;
    text-align: center;
  }
  & td {
    border: 1px solid black;
    text-align: center;
  }
  & tr {
    border-bottom: 1pt solid black;
    border-top: 1pt solid black;
  }
`;

const InvoiceDetails = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(initialState);
  const [rates, setRates] = useState(0);
  const [kdv, setKdv] = useState(0);
  const [currency, setCurrency] = useState("");
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [client, setClient] = useState([]);
  const [type, setType] = React.useState("");
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState({});
  const { id } = useParams();
  const { invoice } = useSelector((state) => state.invoices);
  const dispatch = useDispatch();
  const history = useHistory();
  const [sendStatus, setSendStatus] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);
  // eslint-disable-next-line
  const [openSnackbar, closeSnackbar] = useSnackbar();
  const user = JSON.parse(localStorage.getItem("profile"));
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "invoice",
    onAfterprint: () => alert("Erfolg."),
  });
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
      backgroundColor: "#FFFFFF",
      borderRadius: "10px 10px 0px 0px",
    },
  }));

  const classes = useStyles();

  useEffect(() => {
    dispatch(getInvoice(id));
  }, [id, dispatch, location]);

  useEffect(() => {
    if (invoice) {
      //Automatically set the default invoice values as the ones in the invoice to be updated
      setInvoiceData(invoice);
      setRates(invoice.rates);
      setClient(invoice.client);
      setType(invoice.type);
      setStatus(invoice.status);
      setSelectedDate(invoice.dueDate);
      setKdv(invoice.kdv);
      setCurrency(invoice.currency);
      setSubTotal(invoice.subTotal);
      setTotal(invoice.total);
      setCompany(invoice?.businessDetails?.data?.data);
    }
  }, [invoice]);

  //Get the total amount paid
  let totalAmountReceived = 0;
  for (var i = 0; i < invoice?.paymentRecords?.length; i++) {
    totalAmountReceived += Number(invoice?.paymentRecords[i]?.amountPaid);
  }

  const editInvoice = (id) => {
    history.push(`/edit/invoice/${id}`);
  };
  console.log(invoiceData);
  const createAndDownloadPdf = (invoice_number) => {
    setDownloadStatus("loading");
    const input = document.getElementById("pagetodownload");
    html2canvas(input)
      .then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("img/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`invoice_${invoice_number}`);
      })
      .then(() => setDownloadStatus("success"));

    /*
    setDownloadStatus("loading");
    axios
      .post(`${process.env.REACT_APP_API}/create-pdf`, {
        name: invoice.client.name,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
        dueDate: invoice.dueDate,
        date: invoice.createdAt,
        id: invoice.invoiceNumber,
        notes: invoice.notes,
        subTotal: toCommas(invoice.subTotal),
        total: toCommas(invoice.total),
        type: invoice.type,
        kdv: invoice.kdv,
        items: invoice.items,
        status: invoice.status,
        totalAmountReceived: toCommas(totalAmountReceived),
        balanceDue: toCommas(total - totalAmountReceived),
        company: company,
      })
      .then(() =>
        axios.get(`${process.env.REACT_APP_API}/fetch-pdf`, {
          responseType: "blob",
        })
      )
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });

        saveAs(pdfBlob, "invoice.pdf");
      })
      .then(() => setDownloadStatus("success"));
    */
  };

  //SEND PDF INVOICE VIA EMAIL
  /*const sendPdf = (e) => {
    e.preventDefault();
    setSendStatus("loading");
    axios
      .post(`${process.env.REACT_APP_API}/send-pdf`, {
        name: invoice.client.name,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
        dueDate: invoice.dueDate,
        date: invoice.createdAt,
        id: invoice.invoiceNumber,
        notes: invoice.notes,
        subTotal: toCommas(invoice.subTotal),
        total: toCommas(invoice.total),
        type: invoice.type,
        kdv: invoice.kdv,
        items: invoice.items,
        status: invoice.status,
        totalAmountReceived: toCommas(totalAmountReceived),
        balanceDue: toCommas(total - totalAmountReceived),
        link: `${process.env.REACT_APP_URL}/invoice/${invoice._id}`,
        company: company,
      })
      // .then(() => console.log("invoice sent successfully"))
      .then(() => setSendStatus("success"))
      .catch((error) => {
        console.log(error);
        setSendStatus("error");
      });
  };
*/
  const iconSize = {
    height: "18px",
    width: "18px",
    marginRight: "10px",
    color: "gray",
  };
  const [open, setOpen] = useState(false);

  function checkStatus() {
    return totalAmountReceived >= total
      ? "green"
      : status === "Teilweise bezahlt"
      ? "#1976d2"
      : status === "Bezahlt"
      ? "green"
      : status === "Unbezahlt"
      ? "red"
      : "red";
  }

  if (!invoice) {
    return <Spinner />;
  }

  return (
    <div className={styles.PageLayout}>
      {invoice?.creator?.includes(
        user?.result?._id || user?.result?.googleId
      ) && (
        <div className={styles.buttons}>
          <ProgressButton onClick={handlePrint}>
            PDF Herunterladen
          </ProgressButton>

          {/*
<PDFDownloadLink style={{ "textDecoration":"none" }} document={<PdfFile/>} fileName="FORM">
  {({loading})=>(loading?<button className={styles.btn}>
    PDF wird geladen
          </button>:<button className={styles.btn}>
          PDF Herunterladen
          </button>)}
</PDFDownloadLink>*/}

          <button
            className={styles.btn}
            onClick={() => editInvoice(invoiceData._id)}
          >
            <BorderColorIcon style={iconSize} />
            Rechnung bearbeiten
          </button>

          <button
            // disabled={status === 'Paid' ? true : false}
            className={styles.btn}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MonetizationOnIcon style={iconSize} />
            Zahlungs Informationen
          </button>
        </div>
      )}

      {invoice?.paymentRecords.length !== 0 && (
        <PaymentHistory paymentRecords={invoiceData?.paymentRecords} />
      )}
      <div
        ref={componentRef}
        style={{ width: "100%", height: window.innerHeight }}
      >
        <Modal open={open} setOpen={setOpen} invoice={invoice} />
        <div className={styles.invoiceLayout} id="pagetodownload">
          <img src={logo} style={{ maxHeight: "150px" }} alt="" />
          {/*<Container className={classes.headerContainer}>
          
          <Grid
            container
            justifyContent="space-between"
            style={{ padding: "30px 0px" }}
          >
            {!invoice?.creator?.includes(
              user?.result._id || user?.result?.googleId
            ) ? (
              <Grid item></Grid>
            ) : (
              <Grid
                item
                onClick={() => history.push("/settings")}
                style={{ cursor: "pointer" }}
              >
                {company?.logo ? (
                  <img src={company?.logo} alt="Logo" className={styles.logo} />
                ) : (
                  <h2>{company?.name}</h2>
                )}
              </Grid>
            )}
            <Grid item style={{ marginRight: 40, textAlign: "right" }}>
              <Typography
                style={{
                  lineSpacing: 1,
                  fontSize: 45,
                  fontWeight: 700,
                  color: "gray",
                }}
              >
                {Number(total - totalAmountReceived) <= 0 ? "Receipt" : type}
              </Typography>
              <Typography variant="overline" style={{ color: "gray" }}>
                No:{" "}
              </Typography>
              <Typography variant="body2">
                {invoiceData?.invoiceNumber}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        <Divider />*/}

          <Container>
            <Grid
              container
              justifyContent="space-between"
              style={{ marginTop: "10px" }}
            >
              <Grid item>
                {/*invoice?.creator?.includes(user?.result._id) && (
                <Container style={{ marginBottom: "20px" }}>
                  <Typography
                    variant="overline"
                    style={{
                      color: "gray",
                      paddingRight: "3px",
                      fontSize: "17px",
                    }}
                    gutterBottom
                  >
                    From
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    style={{
                      fontSize: "20px",
                      marginBottom: "5px",
                    }}
                    gutterBottom
                  >
                    {invoice?.businessDetails?.data?.data?.businessName}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      fontSize: "17px",
                      marginBottom: "5px",
                    }}
                  >
                    {invoice?.businessDetails?.data?.data?.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      fontSize: "17px",
                      marginBottom: "5px",
                    }}
                  >
                    {invoice?.businessDetails?.data?.data?.phoneNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      fontSize: "17px",
                      marginBottom: "5px",
                    }}
                  >
                    {invoice?.businessDetails?.data?.data?.address}
                  </Typography>
                </Container>
              )*/}
                <Container>
                  {/*<Typography
                  variant="overline"
                  style={{
                    color: "gray",
                    paddingRight: "3px",
                    fontSize: "17px",
                  }}
                  gutterBottom
                >
                  Bill to
                </Typography>*/}
                  <p>{client.name}</p>
                  <br />
                  {/*<Typography
                  variant="body2"
                  style={{
                    fontSize: "17px",
                    marginBottom: "5px",
                  }}
                >
                  {client?.email}
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    fontSize: "17px",
                    marginBottom: "5px",
                  }}
                >
                  {client?.phone}
                </Typography>*/}
                  <p>{client?.address}</p>
                </Container>
              </Grid>

              <Grid item style={{ marginRight: 20, textAlign: "right" }}>
                <Typography
                  variant="overline"
                  style={{ fontSize: "15px", color: "gray" }}
                  gutterBottom
                >
                  Rechnung
                </Typography>
                <br />
                <p>Rechnungsnr.: {invoice.invoiceNumber}</p>
                <p>
                  Kundennr.:{" "}
                  {String(client?.phone).split(" ").join("").slice(1)}
                </p>
                <p>Datum: {moment().format("MMM Do YYYY")}</p>
                <p>
                  Gültig bis:{" "}
                  {selectedDate
                    ? moment(selectedDate).format("MMM Do YYYY")
                    : "27th Sep 2021"}
                </p>
                <br />
                <br />
                {/*<Typography
                variant="body2"
                gutterBottom
                style={{ color: checkStatus(), fontSize: "20px" }}
              >
                {totalAmountReceived >= total ? "Paid" : status}
              </Typography>
              <Typography
                variant="overline"
                style={{ fontSize: "15px", color: "gray" }}
                gutterBottom
              >
                Date
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
                Due Date
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
                Amount
              </Typography>
              <Typography
                variant="body2"
                style={{ fontSize: "20px" }}
                gutterBottom
              >
                {currency} {toCommas(total)}
              </Typography>*/}
              </Grid>
            </Grid>
          </Container>
          <Container>
            <Grid>
              <p>
                Vielen Dank für Ihr freundliches Intresse an unserer Arbeit.
              </p>
              <br />
            </Grid>
          </Container>

          <form>
            <div>
              <TableControl>
                <tr>
                  <th>Pos</th>
                  <th>Produkt Name</th>
                  <th>Produkt Foto</th>
                  <th>Menge</th>
                  <th>Einheit</th>
                  <th>Steuer</th>
                  <th>Preis</th>
                  <th>Rabatt(%)</th>
                  <th>Gesamtmenge</th>
                </tr>
                {invoiceData?.items?.map((itemField, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{itemField.itemName}</td>
                    <td>
                      <img
                        src={itemField.selectedFiles}
                        alt=""
                        width="90"
                        height="90"
                        value={itemField.selectedFiles}
                      />
                    </td>
                    <td>{itemField?.quantity}</td>
                    <td>{itemField?.unit}</td>
                    <td>%{itemField?.rates}</td>
                    <td>{itemField?.unitPrice}</td>
                    <td>{itemField?.discount || "---"}</td>
                    <td>
                      {(itemField.quantity * itemField.unitPrice -
                        (itemField.quantity *
                          itemField.unitPrice *
                          itemField.discount) /
                          100) *
                        (itemField.rates / 100) +
                        (itemField.quantity * itemField.unitPrice -
                          (itemField.quantity *
                            itemField.unitPrice *
                            itemField.discount) /
                            100)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="8">Gesamtbetrag</td>
                  <td>{subTotal}</td>
                </tr>
              </TableControl>
              {/*}
            <TableContainer component={Paper}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData?.items?.map((itemField, index) => (
                    <TableRow key={index}>
                      <TableCell>
                      {index+1}
                    </TableCell>
                      <TableCell scope="row" style={{ width: "40%" }}>
                        {" "}
                        <InputBase
                          style={{ width: "100%" }}
                          outline="none"
                          sx={{ ml: 1, flex: 1 }}
                          type="text"
                          name="itemName"
                          value={itemField.itemName}
                          placeholder="Item name or description"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                      <img
                        src={itemField.selectedFiles}
                        alt=""
                        width="150"
                        height="100"
                        value={itemField.selectedFiles}
                      />
                    </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="quantity"
                          value={itemField?.quantity}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="text"
                          name="unit"
                          value={itemField?.unit}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="text"
                          name="rate"
                          value={itemField?.rates}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="unitPrice"
                          value={itemField?.unitPrice}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="discount"
                          value={itemField?.discount}
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="amount"
                          value={
                            ((itemField.quantity * itemField.unitPrice -
                            (itemField.quantity *
                              itemField.unitPrice  *
                              itemField.discount) /
                              100)*(itemField.rates/100))+(itemField.quantity * itemField.unitPrice -
                                (itemField.quantity *
                                  itemField.unitPrice  *
                                  itemField.discount) /
                                  100)
                          }
                          readOnly
                        />{" "}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>*/}
              <div className={styles.addButton}></div>
            </div>

            <div className={styles.invoiceSummary}>
              <div className={styles.summary}>Gesamtbetrag der Rechnung</div>
              <div className={styles.summaryItem}>
                <p>Zwischenrunde</p>
                <h4>{subTotal}</h4>
              </div>
              {/*<div className={styles.summaryItem}>
              <p>{`KDV(${rates}%):`}</p>
              <h4>{kdv}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>Total</p>
              <h4>
                {currency} {toCommas(total)}
              </h4>
          </div>*/}
              <div className={styles.summaryItem}>
                <p>Bezahlt</p>
                <h4>
                  {currency} {toCommas(totalAmountReceived)}
                </h4>
              </div>

              <div className={styles.summaryItem}>
                <p>Gesamtbetrag:</p>
                <h4
                  style={{
                    color: "black",
                    fontSize: "18px",
                    lineHeight: "8px",
                  }}
                >
                  {currency} {toCommas(total - totalAmountReceived)}
                </h4>
              </div>
            </div>

            {/*<div className={styles.note}>
            <h4 style={{ marginLeft: "-10px" }}>Note/Payment Info</h4>
            <p style={{ fontSize: "14px" }}>{invoiceData.notes}</p>
          </div>*/}

            {/* <button className={styles.submitButton} type="submit">Save and continue</button> */}
          </form>
          <img
            src={footer}
            style={{ maxHeight: "200px" }}
            width="800px"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
