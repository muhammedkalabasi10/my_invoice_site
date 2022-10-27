import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../photos/logo.png';

const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#E4E4E4'
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1
    },
    yazi:{
      fontSize:50
    }
  });
  
  // Create Document Component
  const PdfFile = () => (
    <div>
      <header>
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
    </header>
    <center>
    <p style={styles.yazi}> Bu bir paragraftır </p>
    </center>
    </div>
  );

  export default PdfFile;