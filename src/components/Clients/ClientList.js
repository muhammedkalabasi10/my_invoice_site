/* eslint-disable */
import React, { useState, useEffect } from "react";
import Clients from "./Clients";
import AddClient from "./AddClient";
import { getClientsByUser } from "../../actions/clientActions";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { Button, Box } from "@material-ui/core";
import NoData from "../svgIcons/NoData";
import Spinner from "../Spinner/Spinner";
import "./Clients.module.css";

const ClientList = () => {
  const history = useHistory();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("profile"));
  const { clients } = useSelector((state) => state.clients);
  const isLoading = useSelector((state) => state.clients.isLoading);
  // const clients = []

  // useEffect(() => {
  // }, [currentId, dispatch]);

  //     useEffect(() => {
  //         dispatch(getClients(1));
  //         // dispatch(getClientsByUser({userId : user?.result?._id}));
  //         // dispatch(getClientsByUser({ search :user?.result?._id, tags: tags.join(',') }));
  //     },[location]
  // )

  useEffect(() => {
    dispatch(
      getClientsByUser({ search: user?.result?._id || user.result.googleId })
    );
  }, [location, dispatch]);

  if (!user) {
    history.push("/login");
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          paddingTop: "20px",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          paddingTop: "20px",
          margin: "80px",
        }}
      >
        <NoData />
        <AddClient
          open={open}
          setOpen={setOpen}
          currentId={currentId}
          setCurrentId={setCurrentId}
        />
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "nowrap",
          }}
        >
          <Box sx={{ m: 1 }}>
            <Button
              color="primary"
              onClick={() => setOpen((prev) => !prev)}
              variant="contained"
              size="lg"
              active
            >
              Kunde hinzuf??gen
            </Button>
          </Box>
        </Box>
        <p style={{ padding: "40px", color: "gray", textAlign: "center" }}>
          Noch keine kunden. Klicken sie auf die schaltfl??che, um kunden
          hinzuzuf??gen.
        </p>
      </div>
    );
  }

  return (
    <div>
      <AddClient
        open={open}
        setOpen={setOpen}
        currentId={currentId}
        setCurrentId={setCurrentId}
      />
      <Clients
        open={open}
        setOpen={setOpen}
        currentId={currentId}
        setCurrentId={setCurrentId}
        clients={clients}
      />
    </div>
  );
};

export default ClientList;
