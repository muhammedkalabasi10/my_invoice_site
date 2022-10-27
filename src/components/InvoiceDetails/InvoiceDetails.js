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
import Typography from "@material-ui/core/Typography";
import { Container, Grid } from "@material-ui/core";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import Spinner from "../Spinner/Spinner";
import { useReactToPrint } from "react-to-print";
import Modal from "../Payments/Modal";
import PaymentHistory from "./PaymentHistory";
import logo from "../../photos/logo.png";
import footer from "../../photos/footer.jpg";
import html2canvas from "html2canvas";
import styled from "styled-components";

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
    documentTitle: `invoice_${invoice?.invoiceNumber}`,
    onAfterprint: () => console.log("indirildi")
  });

  const clickPrint=()=>{
    handlePrint();
    setDownloadStatus("success");
  }
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
      : status === "Partial"
      ? "#1976d2"
      : status === "Paid"
      ? "green"
      : status === "Unpaid"
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
          {/*<ProgressButton
            onClick={sendPdf}
            state={sendStatus}
            onSuccess={() => openSnackbar("Invoice sent successfully")}
          >}
            Send to Customer
          </ProgressButton>*/}
          <button className={styles.btn} onClick={clickPrint} state={downloadStatus}>
            PDF Herunterladen
          </button>

          <button
            className={styles.btn}
            onClick={() => editInvoice(invoiceData._id)}
          >
            <BorderColorIcon style={iconSize} />
            Edit Invoice
          </button>

          <button
            // disabled={status === 'Paid' ? true : false}
            className={styles.btn}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MonetizationOnIcon style={iconSize} />
            Record Payment
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
          <img src={logo} style={{ maxHeight: "200px" }} alt="" />

          <Container>
            <Grid
              container
              justifyContent="space-between"
              style={{ marginTop: "40px" }}
            >
              <Grid item>
                <Container>
                  <p>{client.name}</p>
                  <br />
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
                        width="150"
                        height="100"
                        value={itemField.selectedFiles}
                      />
                    </td>
                    <td>{itemField?.quantity}</td>
                    <td>{itemField?.unit}</td>
                    <td>%{itemField?.rates}</td>
                    <td>{itemField?.unitPrice}</td>
                    <td>%{itemField?.discount}</td>
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
              <div className={styles.addButton}></div>
            </div>

            <div className={styles.invoiceSummary}>
              <div className={styles.summary}>Gesamtbetrag der Rechnung</div>
              <div className={styles.summaryItem}>
                <p>Zwischenrunde</p>
                <h4>{subTotal}</h4>
              </div>
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
          </form>
          <img src={footer} style={{ maxHeight: "240px" }} alt="" />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
