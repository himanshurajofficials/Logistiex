/* eslint-disable prettier/prettier */
import { NativeBaseProvider, Image, Box, Fab, Icon, Button ,Alert, Modal, Input} from 'native-base';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Text,View, ScrollView, Vibration, ToastAndroid,TouchableOpacity,StyleSheet} from 'react-native';
import { Center } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { openDatabase } from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import RNBeep from 'react-native-a-beep';
import { Picker } from '@react-native-picker/picker';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import { backgroundColor, borderColor, height, marginTop, style } from 'styled-system';
import { Console } from 'console';
import { truncate } from 'fs/promises';

const db = openDatabase({
  name: 'rn_sqlite',
});

const HandoverShipmentRTO = ({route}) => {
    const [barcodeValue,setBarcodeValue] = useState('');
    const [packageValue,setpackageValue] = useState('');
    const [otp,setOtp] = useState('');
    const [flag, setflag] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [pending, setPending] = useState(0);
    const [expected, setExpected] = useState(0);
    const [newaccepted, setnewAccepted] = useState(0);
    const [newrejected, setnewRejected] = useState(0);
    const [barcode, setBarcode] = useState('');
    const [len, setLen] = useState(0);
    const [DropDownValue, setDropDownValue] = useState(null);
    const [rejectedData, setRejectedData] = useState([]);
    const RejectReason = 'https://bked.logistiex.com/ADupdatePrams/getUSER';
    const [latitude, setLatitude] = useState(0);
    const [longitude , setLongitude] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [bagId, setBagId] = useState('');
    const [bagIdNo, setBagIdNo] = useState(1);
    const [showCloseBagModal, setShowCloseBagModal] = useState(false);
    const [bagSeal, setBagSeal] = useState('');
    const [data, setData] = useState();

    useEffect(() => {
      setBagId();
    }, [bagId]);

    // useEffect(() => {
    //       updateDetails2();
    //       console.log("fdfdd "+barcode);
    // });

    function CloseBag(){
      console.log(bagId);
      console.log(bagSeal);
      setBagId('');
      setBagIdNo(bagIdNo + 1);
    }

      const updateDetails2 = () => {
        console.log('scan 4545454');

        db.transaction((tx) => {
            tx.executeSql('UPDATE SellerMainScreenDetailsRTO SET status="accepted" WHERE consignorCode=?', [barcode], (tx1, results) => {
                let temp = [];
                console.log('Results',results.rowsAffected);
                console.log(results);

                if (results.rowsAffected > 0) {
                  console.log(barcode + 'accepted');
                  ToastAndroid.show(barcode +" Accepted",ToastAndroid.SHORT);

                } else {
                  console.log(barcode + 'not accepted');
                }
                console.log(results.rows.length);
                for (let i = 0; i < results.rows.length; ++ i) {
                    temp.push(results.rows.item(i));
                }
                console.log("Data updated: \n ", JSON.stringify(temp, null, 4));
                // viewDetails2();
            });
        });
      };


      const loadDetails = (datas) => { 
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM SyncSellerPickUp WHERE consignorCode=?', [datas], (tx1, results) => { 
                let temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                setData(temp);
                
            });
        });
    };

    const getCategories = (data) => {
      db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM SellerMainScreenDetailsRTO WHERE consignorCode = ? AND status = 'Rejected' `,
          [data],
          (sqlTxn, res) => {
            console.log('categories retrieved successfully', res.rows.length);
            setLen(res.rows.length);
            if (!res.rows.length){
              alert('You are scanning wrong product, please check.');
            }else{
                setBarcode(() => data);
                Vibration.vibrate(100);
                RNBeep.beep();
                updateDetails2();
                setLen(false);
                loadDetails(data);
            }
          },
          error => {
            console.log('error on getting categories ' + error.message);
          },
        );
      });
    };

    
    const onSuccess = e => {
      console.log(e.data, 'barcode');
      getCategories(e.data);
    };


    
    const navigation = useNavigation();
    const [count, setcount] = useState(0);

    console.log(barcode, 'barcode')
    console.log('datatanmay', data.consignorName)

  return (
    <NativeBaseProvider>
      <Modal isOpen={showCloseBagModal} onClose={() => setShowCloseBagModal(false)} size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header></Modal.Header>
          <Modal.Body>
            <Input placeholder="Enter Bag Seal" size="md" onChangeText={(text)=>setBagSeal(text)} />
            <Button flex="1" mt={2} bg="#004aad" onPress={() => { CloseBag(), setShowCloseBagModal(false); }}>Submit</Button>
            <View style={{alignItems: 'center', marginTop: 15}}>
              <View style={{width: '98%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 10}}>
                <Text style={{fontSize: 16, fontWeight: '500', color: 'black'}}>Seller Code</Text>
                {
                    data ? (
                        <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>{data.consignorName}</Text>
                    ):null
                }
              </View>
              <View style={{width: '98%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', padding: 10}}>
                <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>Seller Name</Text>
                <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>fgh</Text>
              </View>
              <View style={{width: '98%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 1, borderColor: 'lightgray', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 10}}>
                <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>Number of Shipments</Text>
                <Text style={{fontSize: 16, fontWeight: '500', color : 'black'}}>23</Text>
              </View>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header></Modal.Header>
          <Modal.Body>
          <Text style={{fontWeight:'bold'}}>The Seller has 123 shipments. Would you like to open the Bag?</Text>
          <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', marginTop: 10 }}>
            <Button w="48%" size="lg" bg="#004aad" >Yes</Button>
            <Button w="48%" size="lg" bg="#004aad">No</Button>
          </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <ScrollView style={{paddingTop: 20, paddingBottom: 50}} showsVerticalScrollIndicator={false}>
        <QRCodeScanner
          onRead={onSuccess}
          reactivate={true}
          reactivateTimeout={3000}
          flashMode={RNCamera.Constants.FlashMode.off}
          containerStyle={{width: '100%', alignSelf: 'center', backgroundColor: 'white'}}
          cameraStyle={{width: '90%', alignSelf: 'center'}}
          topContent={
            <View><Text>okay</Text></View>
          }
        />
        <View>
          <View style={{backgroundColor: 'white'}}>
            <View style={{alignItems: 'center', marginTop: 15}}>

              <View style={{backgroundColor: 'lightgray', padding: 10, flexDirection: 'row', justifyContent: 'space-between', width: '90%', borderRadius: 5}}>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>shipment ID: </Text>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>{barcode}</Text>
              </View>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 10}}>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>Seller Code</Text>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>gyu</Text>
              </View>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', padding: 10}}>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>Seller Name</Text>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>ghj</Text>
              </View>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 10}}>
                <Text style={{fontSize: 13, fontWeight: '500', color: 'black'}}>Shipment scan Progress for </Text>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>10/50</Text>
              </View>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 0, borderColor: 'lightgray', padding: 10}}>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>Bags Open</Text>
                <Text style={{fontSize: 18, fontWeight: '500', color: 'black'}}>Yes/No</Text>
              </View>
            </View>
          </View>
          <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', marginTop: 10 }}>
            <Button w="48%" size="lg" bg="#004aad" onPress={()=>setShowCloseBagModal(true)}>Close Bag</Button>
            <Button w="48%" size="lg" bg="#004aad" onPress={()=>navigation.navigate('OpenBags')}>Close Handover</Button>
          </View>
          <Center>
            <Image
              style={{
              width:150,
              height:100,
              }}
              source={require('../../assets/image.png')} alt={'Logo Image'}
            />
          </Center>
        </View>
        {/* <Fab onPress={() => handleSync()} position="absolute" size="sm" style={{backgroundColor: '#004aad'}} icon={<Icon color="white" as={<MaterialIcons name="sync" />} size="sm" />} /> */}
      </ScrollView>
    </NativeBaseProvider>
  );
};

export default HandoverShipmentRTO;

export const styles = StyleSheet.create({
  normal:{
    fontFamily:'open sans',
    fontWeight:'normal',
    fontSize:20,
    color:'#eee',
    marginTop:27,
    paddingTop:15,
    marginLeft:10,
    marginRight:10,
    paddingBottom:15,
    backgroundColor:'#eee',
    width: 'auto',
    borderRadius:0,
  },
  container:{
   flexDirection:'row',
  },
  text:{
    color:'#000',
    fontWeight:'bold',
    fontSize:18,
    textAlign:'center',
  },
  main1:{
    backgroundColor:'#004aad',
    fontFamily:'open sans',
    fontWeight:'normal',
    fontSize:20,
    marginTop:27,
    paddingTop:15,
    marginLeft:10,
    marginRight:10,
    paddingBottom:15,
    width: 'auto',
    borderRadius:20,
  },
  textbox1:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:18,
    width:'auto',
    flexDirection: 'column',
    textAlign:'center',
  },

  textbtn:{
    alignSelf: 'center',
    color:'#fff',
    fontWeight:'bold',
    fontSize:18,
  },
  btn:{
    fontFamily:'open sans',
    fontSize:15,
    lineHeight:10,
    marginTop:80,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'#004aad',
    width:100,
    borderRadius:10,
    paddingLeft:0,
    marginLeft:60,
  },
  bt3: {
    fontFamily: 'open sans',
    color:'#fff',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 10,
    marginTop: 10,
    backgroundColor: '#004aad',
    width: 'auto',
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 10,
    marginRight:15,
    // width:'95%',
    // marginTop:60,
  },
  picker:{
    color:'white',
  },
  pickerItem: {
    fontSize: 20,
    height: 50,
    color: '#ffffff',
    backgroundColor: '#2196f3',
    textAlign: 'center',
    margin: 10,
    borderRadius: 10,
  },
  modalContent: {
    flex:0.57,
    justifyContent:'center',
    width:'85%',
    backgroundColor:'white',
    borderRadius:20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginLeft:28,
    marginTop:175,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor:'rgba(0,0,0,0.3)',
    borderRadius:100,
    margin:5.5,
    color:'rgba(0,0,0,1)',
    alignContent:'center',

  },

  });
