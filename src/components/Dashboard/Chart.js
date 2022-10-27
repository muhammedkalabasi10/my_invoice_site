import React from "react";
import ReactApexChart from "react-apexcharts";

function Chart({ paymentHistory }) {


  let paymentDates = []
  for(let i = 0; i < paymentHistory.length; i++) {
    const newDate = new Date(paymentHistory[i].datePaid);
    let localDate = newDate.toLocaleDateString();
    let newDateArray=localDate.split(".");
    let t=newDateArray[1];
    newDateArray[1]=parseInt(newDateArray[0])+1;
    newDateArray[0]=t;
    localDate=newDateArray.join("/")
          paymentDates = [...paymentDates, localDate]
  }
    
    console.log(paymentHistory)

    let paymentReceived = []
    for(let i = 0; i < paymentHistory.length; i++) {
            paymentReceived = [...paymentReceived, paymentHistory[i].amountPaid]
    }
  
    console.log(paymentDates)
    console.log(paymentReceived)

  const series = [

    {
      name: "Payment Recieved",
      data: paymentReceived
    }
  ];
  const options = {
    chart: {
      zoom: { enabled: false },
      toolbar: {show: false},
    },
    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
    },
    xaxis: {
      type: "datetime",
      categories: paymentDates,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy",
      },
    },
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        textAlign: "center",
        width: '90%',
        margin: '10px auto',
        padding: '10px'
      }}
    >
      <br />
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={300}
        
      />
    </div>
  );
}

export default Chart