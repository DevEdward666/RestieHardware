import { Clipboard } from "@capacitor/clipboard";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLoading,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "@ionic/react/css/ionic-swiper.css";
import { format } from "date-fns";
import EscPosEncoder from "esc-pos-encoder-ionic";
import {
  cashOutline,
  chevronForwardOutline,
  close,
  closeCircle,
  closeCircleOutline,
  closeCircleSharp,
  copy,
  print,
} from "ionicons/icons";
import html2PDF from "jspdf-html2canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/keyboard";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import {
  Addtocart,
  GetDeliveryImagePath,
  PostDeliveryInfoModel,
  PostSelectedOrder,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  FileResponse,
  GetDeliveryInfo,
  GetListOrderInfo,
} from "../../../Models/Response/Inventory/GetInventoryModel";
import {
  GetDeliveryImage,
  SendEmail,
  UpdateCustomerEmail,
  userQuoatationOrderInfo,
} from "../../../Service/API/Inventory/InventoryApi";
import { set_toast } from "../../../Service/Actions/Commons/CommonsActions";
import {
  PostOrder,
  addToCartAction,
  getDelivery,
  getInventory,
  getOrderInfo,
  get_item_returns,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { GetLoginUser } from "../../../Service/Actions/Login/LoginActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import logo from "../../../assets/images/Icon@2.png";
import breakline from "../../../assets/images/breakline.png";
import "./OrderInfo.css";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { Plugins } from "@capacitor/core";
import {
  BleClient,
  numberToUUID,
  numbersToDataView,
} from "@capacitor-community/bluetooth-le";
const OrderInfoComponent = () => {
  const { BluetoothPrinter } = Plugins;
  const order_list_info = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list_info
  );
  const get_voucher = useSelector(
    (store: RootStore) => store.InventoryReducer.get_voucher
  );
  const customer_information = useSelector(
    (store: RootStore) => store.CustomerReducer.customer_information
  );
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const invoiceRef = useRef(null);
  const [getGetDeliveryInfo, setGetDeliveryInfo] = useState<GetDeliveryInfo>({
    deliveryid: "",
    deliveredby: "",
    deliverydate: 0,
    path: "",
  });
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });

  const [getFile, setFile] = useState<FileResponse>();
  const [getDiscount, setDiscount] = useState<number>(0.0);
  const [getTotalAmount, setTotalAmount] = useState<number>(0.0);
  const [getEmail, setEmail] = useState<string>("");
  const [getReturnsFromUrl, setReturnsFromUrl] = useState<string>("");

  const [elapsedTime, setElapsedTime] = useState({
    hour: 0,
    minute: 0,
  });
  const [getOrderDate, setOrderDate] = useState("");
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const formatDate = (datetime: number) => {
    const timestamp = datetime;
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Manila",
    });

    return formattedDate;
  };

  const printWithBluetooth = async (dataView: any) => {
    try {
      await BleClient.initialize();
      const printerId = "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
      const device = await BleClient.requestDevice({
        services: [printerId],
      });
      const isConnected = await BleClient.getDevices([device.deviceId]);
      console.log(isConnected.length);
      console.log(device);
      await BleClient.connect(device.deviceId);

      const chx = await BleClient.getServices(device.deviceId);
      chx[0].characteristics[0].uuid;
      await BleClient.write(
        device.deviceId,
        printerId,
        chx[0].characteristics[0].uuid,
        dataView
      );
      console.log("Print successful");
    } catch (error) {
      console.error("Print error", error);
    }
  };
  // async function populateBluetoothDevices() {
  //   const devicesSelect = document.querySelector("#devicesSelect");
  //   try {
  //     console.log("Getting existing permitted Bluetooth devices...");
  //     const devices = await navigator.bluetooth.getDevices();

  //     console.log("> Got " + devices.length + " Bluetooth devices.");
  //     devicesSelect!.textContent = "";
  //     for (const device of devices) {
  //       const option = document.createElement("option");
  //       option.value = device.id;
  //       option.textContent = device?.name!;
  //       devicesSelect?.appendChild(option);
  //     }
  //   } catch (error) {
  //     console.log("Argh! " + error);
  //   }
  // }
  // async function onRequestBluetoothDeviceButtonClick() {
  //   try {
  //     console.log("Requesting any Bluetooth device...");
  //     const device = await navigator.bluetooth.requestDevice({
  //       // filters: [...] <- Prefer filters to save energy & show relevant devices.
  //       acceptAllDevices: true,
  //     });

  //     console.log("> Requested " + device.name + " (" + device.id + ")");
  //     populateBluetoothDevices();
  //   } catch (error) {
  //     console.log("Argh! " + error);
  //   }
  // }

  function onDisconnect(deviceId: string): void {
    console.log(`device ${deviceId} disconnected`);
  }
  useEffect(() => {
    const initialize = async () => {
      if (get_voucher && get_voucher.description?.length > 0) {
        const totalDiscount =
          order_list_info.order_info?.total -
          order_list_info.order_info?.total * get_voucher.discount;
        setDiscount(get_voucher.discount * 100);
        setTotalAmount(totalDiscount);
      } else {
        if (getReturnsFromUrl === "true") {
          let total = 0;
          order_list_info.return_item.map((val) => {
            total += val.total;
          });
          setTotalAmount(total);
        } else {
          setTotalAmount(order_list_info.order_info?.total);
        }
      }
    };
    initialize();
  }, [get_voucher, order_list_info]);
  const handleSelectOrder = (orderid: string, cartid: string) => {
    const payload: PostSelectedOrder = {
      orderid: orderid,
      userid: "",
    };
    // dispatch(selectedOrder(payload));
    // router.push("/home/cart");
  };
  const handleCancel = useCallback(async () => {
    let newItem: Addtocart;
    let payload: Addtocart[] = [];
    order_list_info.order_item.map((val) => {
      newItem = {
        onhandqty: val?.onhandqty!,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        image: "",
        orderid: order_list_info.order_info.orderid,
        cartid: order_list_info.order_info.cartid,
        createdAt: order_list_info.order_info.createdat,
        status: "cancel",
        reorder: false,
      };
      payload.push(newItem);
    });
    setIsOpenToast({
      toastMessage: "Loading",
      isOpen: true,
      type: "loader",
    });
    const addedOrder: ResponseModel = await dispatch(
      PostOrder(
        payload[0].orderid!,
        payload,
        customer_information,
        new Date().getTime(),
        "Cancel",
        0.0,
        user_login_information.name
      )
    );
    if (addedOrder) {
      const payload: PostSelectedOrder = {
        orderid: addedOrder.result?.orderid!,
        userid: "",
        cartid: addedOrder.result?.cartid!,
      };
      dispatch(getOrderInfo(payload));
      setIsOpenToast({
        toastMessage: "Loading",
        isOpen: false,
        type: "loader",
      });
      router.push(
        `/orderInfo?orderid=${order_list_info.order_info.orderid!}&return=false`
      );
    }
  }, [dispatch, user_login_information, order_list_info]);
  const handleApprove = () => {
    let newItem: Addtocart;
    let payload: Addtocart[] = [];
    order_list_info.order_item.map((val) => {
      newItem = {
        onhandqty: val?.onhandqty!,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        image: "",
        orderid: order_list_info.order_info.orderid,
        cartid: order_list_info.order_info.cartid,
        createdAt: order_list_info.order_info.createdat,
        status: order_list_info.order_info.status,
      };
      payload.push(newItem);
    });

    dispatch(addToCartAction(payload));
    router.push("/paymentoptions");
  };
  const handleEdit = useCallback(
    (reorder: boolean) => {
      // let payload: Addtocart[] = []; // Initialize payload as an empty array
      // order_list_info.map((val) => {
      //   const newItem: Addtocart = {
      //     onhandqty: val.onhandqty,
      //     orderid: val.orderid,
      //     cartid: val.cartid,
      //     code: val.code,
      //     item: val.item,
      //     qty: val.qty,
      //     price: val.price,
      //     createdAt: val.createdat,
      //     status: val.status,
      //   };
      //   payload.push(newItem);
      // });
      let newItem: Addtocart;
      let payload: Addtocart[] = [];
      order_list_info.order_item.map((val) => {
        newItem = {
          onhandqty: val?.onhandqty!,
          code: val.code,
          item: val.item,
          qty: val.qty,
          price: val.price,
          image: "",
          orderid: order_list_info.order_info.orderid,
          cartid: order_list_info.order_info.cartid,
          transid: order_list_info.order_info.transid,
          createdAt: reorder
            ? new Date().getTime()
            : order_list_info.order_info.createdat,
          status: order_list_info.order_info.status,
          reorder: reorder,
        };
        payload.push(newItem);
      });
      dispatch(addToCartAction(payload));
      router.push("/home/cart");
    },
    [dispatch, order_list_info]
  );

  const handleClose = useCallback(() => {
    dispatch(
      getInventory({
        page: 1,
        offset: 0,
        limit: 10,
        searchTerm: "",
      })
    );
    router.push("/orders");
  }, [dispatch]);
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  const isReturn = () => {
    const url = new URL(window.location.href);
    const isreturn = url.searchParams.get("return");
    setReturnsFromUrl(isreturn!);
  };
  useEffect(() => {
    const initialize = async () => {
      const orderid = getOrderIDFromURL();
      await dispatch(getOrderInfo({ orderid: orderid! }));
      isReturn();
    };
    initialize();
  }, [dispatch]);
  useEffect(() => {
    const initialize = async () => {
      const orderid = getOrderIDFromURL();
      await dispatch(GetLoginUser());
      const payload: PostDeliveryInfoModel = {
        orderid: order_list_info.order_info?.orderid
          ? order_list_info.order_info?.orderid
          : orderid!,
      };
      const orderdate = format(
        new Date(order_list_info.order_info?.createdat).toISOString(),
        "MMMM dd, yyyy hh:mm a"
      );
      setOrderDate(orderdate);
      if (order_list_info.order_info?.status !== "Delivered") {
        return;
      }
      const imagePath = await dispatch(getDelivery(payload));

      setGetDeliveryInfo({
        deliveredby: imagePath.result.deliveredby,
        deliverydate: imagePath.result.deliverydate,
        path: imagePath.result.path,
        deliveryid: imagePath.result.deliveryid,
      });

      if (imagePath?.statusCode === 200) {
        const imageDeliveryPayload: GetDeliveryImagePath = {
          imagePath: imagePath.result.path,
        };
        const imageFile = await GetDeliveryImage(imageDeliveryPayload);
        setFile(imageFile.result.image);
      }

      const deliveryDate = new Date(imagePath.result.deliverydate);
      const orderCreationDate = new Date(order_list_info.order_info?.createdat);
      const timeDifference =
        deliveryDate.getTime() - orderCreationDate.getTime();

      // Convert milliseconds to hours and minutes
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      setElapsedTime({
        hour: hours,
        minute: minutes,
      });
    };
    initialize();
  }, [dispatch, order_list_info]);
  const copyOrderId = async (orderId: string) => {
    await Clipboard.write({
      string: orderId,
    });
  };
  const handleCopy = async (orderId: string) => {
    await copyOrderId(orderId);
    dispatch(
      set_toast({
        isOpen: true,
        message: "Copy Order ID",
        position: "middle",
        color: "#125B8C",
      })
    );
  };
  const handlePrintQuotation = useCallback(async () => {
    setIsOpenToast({
      toastMessage: "Generating PDF",
      isOpen: true,
      type: "PDF",
    });
    const res = await userQuoatationOrderInfo({
      orderid: order_list_info.order_info.orderid,
    });
    const base64Data = res?.result?.fileContents; // Accessing the Base64 encoded PDF data
    const decodedData = atob(base64Data); // Decoding the Base64 string
    const byteArray = new Uint8Array(decodedData.length);

    for (let i = 0; i < decodedData.length; i++) {
      byteArray[i] = decodedData.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
    const pdfFile = base64toFile(
      base64Data,
      res?.result?.fileDownloadName,
      blob.type
    );
    if (getEmail !== "") {
      setIsOpenToast({
        isOpen: true,
        type: "sending-email",
        toastMessage: "Sending Email",
      });
      await SendEmail(
        "fernandezedward6653@gmail.com",
        getEmail,
        `Quotation for Hardware Order`,
        `<h2>Dear Valued Customer,</h2><br>
  
        <span>I hope this email finds you well. We appreciate the opportunity to provide you with a quotation for the </span>
        <span>hardware items you require. Below, please find the detailed breakdown of the items along with their  </span>
        <span>respective prices: </span><br>
      
        <span>If you require any further information or customization, please feel free to contact us. We are committed  </span>
        <span>to providing the best service possible and look forward to fulfilling your hardware needs. </span><br>

        <span>Thank you for considering Restie Hardware for your hardware requirements. We are eager to serve you. </span><br>

        <p>Best Regards,</p><br>
  
        <p>Restie Hardware</p>
        `,
        pdfFile
      );
      await UpdateCustomerEmail({
        customerid: order_list_info?.order_info.customerid!,
        customer_email: getEmail,
      });
      setIsOpenToast({
        isOpen: false,
        type: "sending-email",
        toastMessage: "Sending Email",
      });
    }
    setEmail("");
  }, [order_list_info, getEmail]);
  const base64toFile = (
    base64Data: string,
    filename: string,
    mimeType: string
  ) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return new File([blob], filename, { type: mimeType });
    } catch (error) {
      console.error("Failed to convert base64 to file:", error);
      return null; // or handle the error as needed
    }
  };

  const downloadPDF = useCallback(async () => {
    setIsOpenToast({ isOpen: false, type: "receipt-email", toastMessage: "" });

    const pages = document.getElementById("receipt");
    const width = pages?.clientWidth;
    const height = pages?.clientHeight;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${currentDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    const filename = `./invoice/${formattedDate}/${
      order_list_info.order_info?.transid?.split("-")[0]
    }.pdf`;

    // await bluetoothSerial.write(printData);
    // await bluetoothSerial.disconnect();
    const pdf = await html2PDF(pages!, {
      jsPDF: {
        unit: "px",
        format: [width!, height! + 100],
      },
      imageType: "image/jpeg",
      imageQuality: 1,
      autoResize: true,
      output: filename,
    });
    const file = pdf.output("dataurlstring");
    const bufferFile = pdf.output("arraybuffer");
    const uint8Array = new Uint8Array(bufferFile);

    // Convert Uint8Array to DataView
    const dataView = new DataView(uint8Array.buffer);

    // pdf.autoPrint();
    const base64PDF = file.split(",")[1]; // Replace 'base64PDFData' with your actual base64-encoded PDF data
    const mimeType = "application/pdf";
    const pdfFile = base64toFile(base64PDF, filename, mimeType);
    let printData; // Declare printData in an outer scope

    // await samplePrint();
    if (getEmail !== "") {
      setIsOpenToast({ isOpen: true, type: "", toastMessage: "Sending Email" });
      await SendEmail(
        "fernandezedward6653@gmail.com",
        getEmail,
        `Your E-Receipt from Restie Hardware: Ensuring a Seamless Transaction:${
          order_list_info.order_info?.transid?.split("-")[0]
        }`,
        `<h2>Dear Valued Customer,</h2><br>
  
        <span>We hope this message finds you well.</p>
        <span>We are pleased to provide you with your electronic receipt (E-receipt) from Restie Hardware, confirming </span>
        <span>your recent transaction with us. At Restie Hardware, we are committed to delivering top-notch service </span>
        <span>and ensuring that your shopping experience is nothing short of exceptional.</span><br>
  
        <span>Your satisfaction is our utmost priority, and we understand the importance of transparency and </p>
        <span>efficiency in every transaction. As such, we have meticulously compiled and generated this E-receipt to </span>
        <span>offer you a comprehensive overview of your purchase details.</span><br>
  
        <p>Please see attached file for the breakdown of your transaction</p><br>
  
        <span>Once again, thank you for choosing Restie Hardware.We look forward to serving you again soon </span>
        <span>and trust that your recent purchase will prove to be both functional and reliable.</span><br>
  
        <p>Best Regards,</p><br>
  
        <p>Restie Hardware</p>
        `,
        // pdfFile
        null
      );
      await UpdateCustomerEmail({
        customerid: order_list_info?.order_info.customerid!,
        customer_email: getEmail,
      });
      setIsOpenToast({
        isOpen: false,
        type: "",
        toastMessage: "Sending Email",
      });
    }
    setEmail("");
    setOpenSearchModal({ isOpen: false, modal: "receipt" });
  }, [getEmail, order_list_info, getOrderDate]);
  const handleSetEmail = useCallback(
    async (ev: Event) => {
      if (order_list_info?.order_info.customer_email?.length! > 0) {
        setEmail(getEmail);
      } else {
        const target = ev.target as HTMLIonInputElement;
        const query = target.value?.toString() ?? "";
        setEmail(query);
      }
    },
    [order_list_info, getEmail]
  );
  useEffect(() => {
    const checkUserEmail = () => {
      if (order_list_info?.order_info.customer_email?.length! > 0) {
        setEmail(order_list_info?.order_info.customer_email!);
      } else {
        setEmail("");
      }
    };
    checkUserEmail();
  }, [order_list_info.order_info.customer_email]);
  const handleRefund = useCallback(() => {
    dispatch(
      get_item_returns({
        transid: order_list_info?.order_info?.transid!,
      })
    );
    router.push(
      `/returnrefund?transid=${order_list_info?.order_info?.transid}&orderid=${order_list_info?.order_info?.orderid}&cartid=${order_list_info?.order_info?.cartid}`
    );
  }, [dispatch, order_list_info]);
  // Generate receipt header
  const generateReceiptHeader = (order_list_info: GetListOrderInfo) => {
    return `Restie Hardware
    \n
    Address: SIR Bucana 76-A
    \nSandawa Matina Davao City
    \nDavao City, Philippines
    \nContact No.: (082) 224 1362
    \nInvoice #: ${
      order_list_info.order_info?.transid?.split("-")[0]
    }\n--------------------------------\n`;
  };

  // Generate customer receipt header
  const generateCustomerReceiptHeader = (
    order_list_info: GetListOrderInfo,
    orderDate: string
  ) => {
    const orderInfo = order_list_info.order_info;
    return `Customer: ${orderInfo?.name}\nAddress: ${orderInfo?.address}\nContact: ${orderInfo?.contactno}\nOrder Type: ${orderInfo?.type}\nOrder Date: ${orderDate}\nCashier: ${orderInfo?.createdby}\n\nItem        Price       Qty`;
  };

  // Generate receipt footer
  const generateReceiptFooter = (order_list_info: GetListOrderInfo) => {
    const totalAmount = order_list_info.order_info?.total.toFixed(2);
    const paidCash = order_list_info.order_info?.paidcash.toFixed(2);
    const change = (
      order_list_info.order_info?.paidcash - getTotalAmount
    ).toFixed(2);
    return `\nAmount Due: ${totalAmount}\nCash: ${paidCash}\nChange: ${change}\n\n`;
  };

  // Generate receipt items
  const generateReceipt = (order_list_info: GetListOrderInfo) => {
    return order_list_info.order_item
      .map((item) => `${item.item} - P${item.price.toFixed(2)} - ${item.qty}`)
      .join("\n");
  };
  const handlePrintInvoice = useCallback(async () => {
    try {
      const encoder = new EscPosEncoder();
      const receiptHeaderText = generateReceiptHeader(order_list_info);
      const receiptCustomerHeaderText = generateCustomerReceiptHeader(
        order_list_info,
        getOrderDate
      );
      const receiptText = generateReceipt(order_list_info);
      const receiptFooter = generateReceiptFooter(order_list_info);

      // Concatenate receipt parts
      const ReceiptHeader = `${receiptHeaderText}\n`;
      const ReceiptSubHeader = `${receiptCustomerHeaderText}`;
      const ReceiptBody = `${receiptText}\n`;
      const ReceiptFooter = `${receiptFooter}\n`;

      // Split receipt parts into chunks and send sequentially
      const chunkSize = 512; // Maximum allowed size
      const chunks = [];
      let startIndex = 0;
      // Center-aligned header
      while (startIndex < ReceiptHeader.length) {
        const centeredHeader = encoder
          .initialize()
          .align("center")
          .text(ReceiptHeader)
          .encode();
        chunks.push(centeredHeader);
        startIndex += chunkSize;
      }
      // Left-aligned subheader
      startIndex = 0;
      while (startIndex < ReceiptSubHeader.length) {
        const subheader = encoder.align("left").text(ReceiptSubHeader).encode();
        chunks.push(subheader);
        startIndex += chunkSize;
      }
      startIndex = 0;
      while (startIndex < ReceiptBody.length) {
        // Left-aligned body
        const body = encoder.align("left").text(ReceiptBody).encode();
        chunks.push(body);
        startIndex += chunkSize;
      }
      startIndex = 0;
      while (startIndex < ReceiptFooter.length) {
        // Left-aligned footer
        const footer = encoder.align("left").text(ReceiptFooter).encode();
        chunks.push(footer);
        startIndex += chunkSize;
      }
      // Send each chunk
      for (const chunk of chunks) {
        await printWithBluetooth(chunk);
      }
    } catch (error) {
      console.error("Error printing:", error);
    }

    setOpenSearchModal({ isOpen: true, modal: "receipt" });
  }, [order_list_info, getOrderDate]);
  return (
    <div className="order-list-info-main-container">
      <div className="order-list-info-footer-approved-details">
        <div className="order-list-info-footer-approved"> </div>
        {getReturnsFromUrl === "false" ? (
          <div>
            {order_list_info.order_info?.paidthru?.toLowerCase() ===
            "cancel" ? (
              <div className="order-list-info-footer-approved-info">
                <>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() => handleEdit(true)}
                  >
                    Reorder
                  </IonButton>
                </>
              </div>
            ) : null}

            {order_list_info.order_info?.paidthru?.toLowerCase() ===
              "pending" ||
            order_list_info.order_info?.paidthru?.toLowerCase() ===
              "quotation" ? (
              <div className="order-list-info-footer-approved-info">
                <>
                  {order_list_info.order_info?.paidthru?.toLowerCase() ===
                  "pending" ? (
                    <IonButton
                      size="small"
                      color="tertiary"
                      onClick={() => handleCancel()}
                    >
                      Cancel Order
                    </IonButton>
                  ) : null}
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() => handleEdit(false)}
                  >
                    Edit Order
                  </IonButton>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() => handleApprove()}
                  >
                    Process Order
                  </IonButton>
                </>
              </div>
            ) : null}
            {order_list_info.order_info?.status?.toLowerCase() ===
            "delivered" ? (
              <div className="order-list-info-footer-approved-info">
                <>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() => handlePrintInvoice()}
                  >
                    Print Invoice
                  </IonButton>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() =>
                      setOpenSearchModal({ isOpen: true, modal: "" })
                    }
                  >
                    Open Delivery Info
                  </IonButton>
                </>
              </div>
            ) : null}
            {order_list_info.order_info?.status === "approved" ? (
              <div className="order-list-info-footer-approved-info">
                <>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() => handlePrintInvoice()}
                  >
                    Print Invoice
                  </IonButton>
                  <IonButton
                    size="small"
                    color="tertiary"
                    onClick={() =>
                      router.push(
                        `/deliveryInfo?orderid=${order_list_info.order_info.orderid}&transid=${order_list_info.order_info.transid}&cartid=${order_list_info.order_info.cartid}`
                      )
                    }
                  >
                    Process Item Delivered
                  </IonButton>
                </>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Customer Name: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.name}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Address: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.address}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Contact No: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.contactno}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Type: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.type}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Created: </div>

        <div className="order-list-info-customer-info">{getOrderDate}</div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Cashier: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info.createdby}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order ID: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.orderid}
        </div>
        <IonButton
          color={"light"}
          onClick={() => handleCopy(order_list_info.order_info?.orderid)}
        >
          <IonIcon src={copy}></IonIcon>
        </IonButton>
      </div>
      {order_list_info.order_info?.transid?.length! > 0 ? (
        <div className="order-list-info-customer-details">
          <div className="order-list-info-customer">Transaction ID: </div>

          <div className="order-list-info-customer-info">
            {order_list_info.order_info?.transid}
          </div>
          <IonButton
            color={"light"}
            onClick={() => handleCopy(order_list_info.order_info?.transid!)}
          >
            <IonIcon src={copy}></IonIcon>
          </IonButton>
        </div>
      ) : null}

      <IonImg className="breakline" src={breakline} />
      <div className="order-list-info-container">
        {getReturnsFromUrl === "true" ? (
          <div>
            {Array.isArray(order_list_info.order_item) &&
            order_list_info.return_item.length > 0 ? (
              order_list_info.return_item.map((items, index) => {
                const returnItems = order_list_info.return_item.find(
                  (returns) => returns.code === items.code
                );

                return (
                  <IonItem
                    className="order-list-info-card-container"
                    key={index}
                    onClick={() =>
                      handleSelectOrder(
                        order_list_info.order_info.orderid,
                        order_list_info.order_info.cartid
                      )
                    }
                  >
                    <div className="order-list-info-card-add-item-container">
                      <div className={`order-list-info-card-main-content`}>
                        <div className="order-list-info-card-content">
                          <div
                            className={`order-list-info-card-title-details `}
                          >
                            {items.item}{" "}
                            {returnItems && (
                              <div className="order-list-info-card-title-details-returns">
                                Return/Refund - {returnItems.qty}
                              </div>
                            )}
                          </div>

                          <div className="order-list-info-card-category-details">
                            <div className="order-list-info-card-category">
                              {/* Brand: {items.brand} | Category:{items.category} */}
                            </div>
                          </div>
                          <div className="order-list-info-card-price-details">
                            <span>&#8369;</span>
                            {items.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-qty">
                            {" "}
                            {`X${items.qty}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </IonItem>
                );
              })
            ) : (
              <div>No items to display</div>
            )}
          </div>
        ) : (
          <div>
            {Array.isArray(order_list_info.order_item) &&
            order_list_info.order_item.length > 0 ? (
              order_list_info.order_item.map((items, index) => {
                const correspondingReturn = order_list_info.return_item.find(
                  (returns) =>
                    returns.code === items.code && returns.qty === items.qty
                );
                const returnItems = order_list_info.return_item.find(
                  (returns) => returns.code === items.code
                );

                return (
                  <IonItem
                    className="order-list-info-card-container"
                    key={index}
                    onClick={() =>
                      handleSelectOrder(
                        order_list_info.order_info.orderid,
                        order_list_info.order_info.cartid
                      )
                    }
                  >
                    <div className="order-list-info-card-add-item-container">
                      <div
                        className={`order-list-info-card-main-content ${
                          correspondingReturn ? "all" : ""
                        }`}
                      >
                        <div className="order-list-info-card-content">
                          <div
                            className={`order-list-info-card-title-details `}
                          >
                            {items.item}{" "}
                            {returnItems && (
                              <div className="order-list-info-card-title-details-returns">
                                Return/Refund - {returnItems.qty}
                              </div>
                            )}
                          </div>

                          <div className="order-list-info-card-category-details">
                            <div className="order-list-info-card-category">
                              Brand: {items.brand} | Category:{items.category}
                            </div>
                          </div>
                          <div className="order-list-info-card-price-details">
                            <span>&#8369;</span>
                            {items.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-qty">
                            {" "}
                            {`X${items.qty}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </IonItem>
                );
              })
            ) : (
              <div>No items to display</div>
            )}
          </div>
        )}
      </div>
      {getReturnsFromUrl === "true" ? (
        <>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Payment Method: </div>
            <div className="order-list-info-footer-info">
              {" "}
              {order_list_info.order_info?.paidthru?.toLocaleUpperCase()}
            </div>
          </div>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Sub-Total: </div>
            <div className="order-list-info-footer-info">
              {" "}
              <span>&#8369;</span>
              {order_list_info.order_info?.total?.toFixed(2)}
            </div>
          </div>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Discount & Vouchers: </div>

            <div className="order-list-info-footer-info">{`${
              getDiscount > 0 ? getDiscount + "%" : 0
            }`}</div>
          </div>
          <IonImg className="breakline" src={breakline} />
          <div className="order-list-info-footer-total-main">
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">
                Amount Return:{" "}
              </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {getTotalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="order-list-info-footer-total-main">
            <div className="order-list-info-footer-total-details-remarks">
              <div className="order-list-info-footer-remarks">Remarks: </div>

              <div className="order-list-info-footer-info-remarks">
                <IonText>{order_list_info.return_item[0]?.remarks}</IonText>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Payment Method: </div>
            <div className="order-list-info-footer-info">
              {" "}
              {order_list_info.order_info?.paidthru?.toLocaleUpperCase()}
            </div>
          </div>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Sub-Total: </div>
            <div className="order-list-info-footer-info">
              {" "}
              <span>&#8369;</span>
              {order_list_info.order_info?.total?.toFixed(2)}
            </div>
          </div>
          <div className="order-list-info-footer-details">
            <div className="order-list-info-footer">Discount & Vouchers: </div>

            <div className="order-list-info-footer-info">{`${
              getDiscount > 0 ? getDiscount + "%" : 0
            }`}</div>
          </div>
          <IonImg className="breakline" src={breakline} />
          <div className="order-list-info-footer-total-main">
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">Amount Due: </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {getTotalAmount?.toFixed(2)}
              </div>
            </div>
            {order_list_info.order_info?.paidcash > 0 ? (
              <>
                <div className="order-list-info-footer-total-details">
                  <div className="order-list-info-footer-total">Cash: </div>

                  <div className="order-list-info-footer-total-info">
                    <span>&#8369;</span>
                    {(order_list_info.order_info?.paidcash).toFixed(2)}
                  </div>
                </div>
                <div className="order-list-info-footer-total-details">
                  <div className="order-list-info-footer-total">Change: </div>

                  <div className="order-list-info-footer-total-info">
                    <span>&#8369;</span>
                    {(
                      order_list_info.order_info?.paidcash - getTotalAmount
                    ).toFixed(2)}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </>
      )}

      <div className="order-info-footer-button">
        {order_list_info.order_info?.paidthru?.toLowerCase() === "quotation" ? (
          <>
            <div
              className="order-info-button-list-normal"
              onClick={() =>
                setIsOpenToast({
                  isOpen: true,
                  type: "quotation-email",
                  toastMessage: "Sending Email",
                })
              }
            >
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon color="medium" icon={print}></IonIcon>
                <IonText className="order-info-button-text">
                  Print Quotation
                </IonText>
              </IonButton>
            </div>
          </>
        ) : null}
        {order_list_info.order_info?.paidthru?.toLowerCase() === "cash" &&
        order_list_info?.return_item.length === 0 ? (
          <div
            className="order-info-button-list-normal"
            onClick={() => handleRefund()}
          >
            <IonButton fill="clear" className="profile-button-order">
              <IonIcon color="medium" icon={cashOutline}></IonIcon>
              <IonText className="order-info-button-text">
                Return/Refund
              </IonText>
            </IonButton>
          </div>
        ) : null}
        <div
          className="order-info-button-list-close"
          onClick={() => handleClose()}
        >
          <IonButton fill="clear" className="profile-button-order">
            <IonIcon color="light" icon={close}></IonIcon>
            <IonText className="order-info-button-text">Close</IonText>
          </IonButton>
        </div>
      </div>
      <IonModal
        isOpen={
          openSearchModal.modal !== "receipt" ? openSearchModal.isOpen : false
        }
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() =>
                  setOpenSearchModal({ isOpen: false, modal: "receipt" })
                }
              >
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">
              {" "}
              Delivery Information
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <>
            {order_list_info?.order_info?.status?.toLowerCase() ===
            "Delivered".toLowerCase() ? (
              <div className="delivery-image-container">
                <div className="delivered-info-container">
                  <IonText className="delivered-info-text">
                    Delivered by:{"  "}
                    {getGetDeliveryInfo.deliveredby}
                  </IonText>
                  <IonText className="delivered-info-text">
                    Delivered at:{"  "}
                    {format(
                      new Date(getGetDeliveryInfo.deliverydate).toISOString(),
                      "MMMM dd, yyyy hh:mm a"
                    )}
                  </IonText>

                  <IonText className="delivered-info-text">
                    Time Elapsed: {elapsedTime.hour} hours {elapsedTime.minute}{" "}
                    minutes
                  </IonText>
                </div>
                {getFile &&
                  getFile.contentType &&
                  getFile.contentType.startsWith("image/") && (
                    <>
                      <IonText className="delivery-image-text">
                        Delivery Image
                      </IonText>
                      <IonImg
                        className="swiper-component"
                        src={"data:image/png;base64," + getFile.fileContents}
                      ></IonImg>
                    </>
                  )}
              </div>
            ) : null}
          </>
        </IonContent>
      </IonModal>
      <IonModal
        isOpen={
          openSearchModal.modal === "receipt" ? openSearchModal.isOpen : false
        }
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() =>
                  setOpenSearchModal({ isOpen: false, modal: "receipt" })
                }
              >
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title"> Invoice</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() =>
                  setIsOpenToast({
                    isOpen: true,
                    type: "receipt-email",
                    toastMessage: "",
                  })
                }
              >
                Print
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div ref={invoiceRef} id="receipt">
            <div className="order-list-info-hardware-details">
              <div className="order-list-info-hardware">
                <img src={logo} />
              </div>
            </div>
            <div className="order-list-info-hardware-details">
              <div className="order-list-info-hardware">Restie Hardware</div>

              {/* <div className="order-list-info-hardware-info">
                {order_list_info.order_info?.name}
              </div> */}
            </div>
            <div className="order-list-info-hardware-details-address">
              <div className="order-list-info-hardware-address">
                Address: SIR Bucana 76-A
              </div>
              <div className="order-list-info-hardware-address">
                Sandawa Matina Davao City
              </div>
              <div className="order-list-info-hardware-address">
                Davao City, Philippines
              </div>
              <div className="order-list-info-hardware-address">
                Contact No.: (082) 224 1362
              </div>
              <hr />
              {/* <div className="order-list-info-hardware-info">
                {order_list_info.order_info?.name}
              </div> */}
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Invoice #: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.transid?.split("-")[0]}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Customer Name: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.name}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Address: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.address}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Contact No: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.contactno}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Order Type: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.type}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Order Created: </div>

              <div className="order-list-info-customer-info">
                {getOrderDate}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Cashier: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info.createdby}
              </div>
            </div>
            <hr />
            {/* <IonImg className="breakline" src={breakline} /> */}
            <div className="order-list-info-container">
              {Array.isArray(order_list_info.order_item) &&
              order_list_info.order_item.length > 0 ? (
                order_list_info?.order_item?.map((items, index) => (
                  <IonItem
                    className="order-list-info-card-container"
                    key={index}
                    onClick={() =>
                      handleSelectOrder(
                        order_list_info.order_info.orderid,
                        order_list_info.order_info.cartid
                      )
                    }
                  >
                    <div className="order-list-info-card-add-item-container">
                      <div className="order-list-info-card-main-content">
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-title-details">
                            {items.item}
                          </div>

                          <div className="order-list-info-card-category-details">
                            <div className="order-list-info-card-category">
                              Brand: {items.brand} | Category:{items.category}
                            </div>
                          </div>
                          <div className="order-list-info-card-price-details">
                            <span>&#8369;</span>
                            {items.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-qty">
                            {" "}
                            X{items.qty}
                          </div>
                        </div>
                      </div>
                    </div>
                  </IonItem>
                ))
              ) : (
                <p>No order info found.</p>
              )}
            </div>
            <div className="order-list-info-footer-details">
              <div className="order-list-info-footer">Payment Method: </div>
              <div className="order-list-info-footer-info">
                {" "}
                {order_list_info.order_info.paidthru.toLocaleUpperCase()}
              </div>
            </div>
            <div className="order-list-info-footer-details">
              <div className="order-list-info-footer">Sub-Total: </div>
              <div className="order-list-info-footer-info">
                {" "}
                <span>&#8369;</span>
                {order_list_info.order_info.total.toFixed(2)}
              </div>
            </div>
            <div className="order-list-info-footer-details">
              <div className="order-list-info-footer">
                Discount & Vouchers:{" "}
              </div>

              <div className="order-list-info-footer-info">{`${
                getDiscount > 0 ? getDiscount + "%" : 0
              }`}</div>
            </div>
            <hr />
            {/* <IonImg className="breakline" src={breakline} /> */}
            <div className="order-list-info-footer-total-main">
              <div className="order-list-info-footer-total-details">
                <div className="order-list-info-footer-total">Amount Due: </div>

                <div className="order-list-info-footer-total-info">
                  <span>&#8369;</span>
                  {getTotalAmount.toFixed(2)}
                </div>
              </div>
              {order_list_info.order_info?.paidcash > 0 ? (
                <>
                  <div className="order-list-info-footer-total-details">
                    <div className="order-list-info-footer-total">Cash: </div>

                    <div className="order-list-info-footer-total-info">
                      <span>&#8369;</span>
                      {order_list_info.order_info.paidcash.toFixed(2)}
                    </div>
                  </div>
                  <div className="order-list-info-footer-total-details">
                    <div className="order-list-info-footer-total">Change: </div>

                    <div className="order-list-info-footer-total-info">
                      <span>&#8369;</span>
                      {(
                        order_list_info.order_info.paidcash - getTotalAmount
                      ).toFixed(2)}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </IonContent>
      </IonModal>
      <IonModal
        onDidDismiss={() =>
          setIsOpenToast({
            isOpen: false,
            type:
              isOpenToast.type === "quotation-email"
                ? "quotation-email"
                : "receipt-email",
            toastMessage: "",
          })
        }
        id="email-modal"
        isOpen={
          isOpenToast.type === "receipt-email" ||
          isOpenToast.type === "quotation-email"
            ? isOpenToast.isOpen
            : false
        }
      >
        <div className="wrapper">
          <IonText className="email-header">
            {isOpenToast.type === "quotation-email"
              ? "Send quotation to customers email"
              : "Send receipt to customers email"}
          </IonText>
          <IonItem>
            <IonInput
              label="Customers Email"
              labelPlacement="floating"
              type="email"
              value={getEmail}
              placeholder="email@gmail.com"
              onIonInput={(e) => handleSetEmail(e)}
            ></IonInput>
          </IonItem>
          <IonButton
            expand="block"
            color={"medium"}
            onClick={() =>
              isOpenToast.type === "quotation-email"
                ? handlePrintQuotation()
                : downloadPDF()
            }
          >
            Submit
          </IonButton>
        </div>
      </IonModal>
      <IonLoading
        isOpen={
          isOpenToast?.type === "receipt-email" ||
          isOpenToast?.type === "quotation-email"
            ? false
            : isOpenToast?.isOpen
        }
        message={isOpenToast?.toastMessage}
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </div>
  );
};

export default OrderInfoComponent;
