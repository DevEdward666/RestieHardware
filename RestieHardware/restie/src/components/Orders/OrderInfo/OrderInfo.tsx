import { BleClient } from "@capacitor-community/bluetooth-le";
import { Clipboard } from "@capacitor/clipboard";
import { Plugins } from "@capacitor/core";
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
  IonToast,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "@ionic/react/css/ionic-swiper.css";
import { format } from "date-fns";
import EscPosEncoder from "esc-pos-encoder-ionic";
import { cashOutline, close, copy, print, refreshOutline, pencilOutline, checkmarkCircleOutline, closeCircleOutline, documentTextOutline, mailOutline, bicycleOutline, cardOutline } from "ionicons/icons";
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
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
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
} from "../../../Service/Actions/Inventory/InventoryActions";
import { GetLoginUser } from "../../../Service/Actions/Login/LoginActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import logo from "../../../assets/images/Icon@2.png";
import breakline from "../../../assets/images/breakline.png";
import "./OrderInfo.css";

const OrderInfoComponent: React.FC = () => {
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
  const [openCashModal, setOpenCashModal] = useState<boolean>(false);
  const [totalCash, setTotalCash] = useState<number>(0);
  const [isOpenMessageToast, setMessageToast] = useState({
    toastMessage: "",
    isOpen: false,
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

  const [modalDismiss, setCanDismiss] = useState<boolean>(false);
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
  const initializeBluetooth = async () => {
    try {
      await BleClient.initialize();
      console.log("Bluetooth initialized");
    } catch (error) {
      console.error("Error initializing Bluetooth:", error);
    }
  };

  // Request Bluetooth device permission
  const requestBluetoothPermission = async () => {
    try {
      const printerId = "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
      const device = await BleClient.requestDevice({
        services: [printerId],
      });
      console.log("Bluetooth device permission granted:", device);
      setPermissionRequested(true);
      return device.deviceId;
    } catch (error) {
      console.error("Error requesting Bluetooth device permission:", error);
      return "";
    }
  };
  const printWithBluetooth = async (dataView: any, deviceId: any) => {
    try {
      // Connect to device
      const printerId = "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
      await BleClient.connect(deviceId);

      // Get characteristics and write data
      const chx = await BleClient.getServices(deviceId);
      await BleClient.write(
        deviceId,
        printerId,
        chx[0].characteristics[0].uuid,
        dataView
      );

      console.log("Print successful");
    } catch (error) {
      console.error("Print error:", error);
    }
  };

  function onDisconnect(deviceId: string): void {
    console.log(`device ${deviceId} disconnected`);
  }
  useEffect(() => {
    const initialize = async () => {
      if (getReturnsFromUrl === "true") {
        let total = 0;
        order_list_info?.return_item.map((val) => {
          total += val.total;
        });
        setTotalAmount(total);
      } else {
        setTotalAmount(
          order_list_info.order_info?.total -
          (order_list_info.order_info.totaldiscount ?? 0)
        );
        setDiscount(order_list_info.order_info.totaldiscount);
      }
    };
    initialize();
  }, [order_list_info, getReturnsFromUrl]);
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
    await saveOrder(payload, "Cancel", 0.0);
  }, [dispatch, user_login_information, order_list_info]);
  const saveOrder = useCallback(
    async (payload: Addtocart[], method: string, cash: number) => {
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
          method,
          cash,
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
          `/orderInfo?orderid=${order_list_info.order_info
            .orderid!}&return=false&notification=false`
        );
      }
    },
    [dispatch]
  );
  const handleApprove = useCallback(async () => {
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
  }, [dispatch, order_list_info]);
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
    const filename = `./invoice/${formattedDate}/${order_list_info.order_info?.transid?.split("-")[0]
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

    // await samplePrint();
    if (getEmail !== "") {
      setIsOpenToast({ isOpen: true, type: "", toastMessage: "Sending Email" });
      await SendEmail(
        "fernandezedward6653@gmail.com",
        getEmail,
        `Your E-Receipt from Restie Hardware: Ensuring a Seamless Transaction:${order_list_info.order_info?.transid?.split("-")[0]
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
        pdfFile
        // null
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
    return `Delivery Receipt\nRestie Hardware\nAddress: SIR Bucana 76-A\nSandawa Matina Davao City\nDavao City, Philippines\nContact No.: (082) 224 1362\nInvoice #: ${order_list_info.order_info?.transid?.split("-")[0]
      }\n--------------------------------`;
  };

  // Generate customer receipt header
  const generateCustomerReceiptHeader = (
    order_list_info: GetListOrderInfo,
    orderDate: string
  ) => {
    const orderInfo = order_list_info.order_info;
    // return `Customer: ${orderInfo?.name}\nAddress: ${orderInfo?.address}\nContact: ${orderInfo?.contactno}\nOrder Type: ${orderInfo?.type}\nOrder Date: ${orderDate}\nCashier: ${orderInfo?.createdby}\nOrder ID: ${orderInfo?.orderid}\n--------------------------------\nCode   Item  Price  Qty  Total\n--------------------------------\n\n`;
    return `Customer: ${orderInfo?.name}\nAddress: ${orderInfo?.address}\nContact: ${orderInfo?.contactno}\nOrder Type: ${orderInfo?.type}\nOrder Date: ${orderDate}\nCashier: ${orderInfo?.createdby}\nOrder ID: ${orderInfo?.orderid}\n--------------------------------\n`;
  };

  // Generate receipt footer
  const generateReceiptFooter = (order_list_info: GetListOrderInfo) => {
    const totalAmount =
      order_list_info.order_info?.total -
      (order_list_info.order_info.totaldiscount ?? 0);
    const totalDiscount = order_list_info.order_info.totaldiscount ?? 0;
    const paidCash = order_list_info.order_info?.paidcash.toFixed(2);
    const change = (
      order_list_info.order_info?.paidcash - getTotalAmount
    ).toFixed(2);
    return `\nAmount Due: ${totalAmount.toFixed(
      2
    )}\nDiscount: ${totalDiscount}\nCash: ${paidCash}\nChange: ${change}\n\n-----------Thank you-----------\n\n`;
  };

  // Generate receipt items
  const generateReceipt = (order_list_info: GetListOrderInfo) => {
    return order_list_info.order_item
      .map(
        (item) =>
          `${item.code}\n${item.item.trim()}\nPrice        Qty      Total\nP${item.price - item.discount_price
          }       |    ${item.qty}    |  P${item.price - (item.discount_price ?? 0) * item.qty
          }
        \n--------------------------------`
      )
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
      const ReceiptHeader = `${receiptHeaderText}`;
      const ReceiptSubHeader = `${receiptCustomerHeaderText}`;
      const ReceiptBody = `${receiptText}\n`;
      const ReceiptFooter = `${receiptFooter}\n`;

      // Encode receipt parts
      const encodedHeader = encoder
        .initialize()
        .newline()
        .align("center")
        .text(ReceiptHeader)
        .align("left")
        .text(ReceiptSubHeader)
        .encode();
      const encodedBody = encoder
        .initialize()
        .align("left")
        .text(ReceiptBody)
        .align("left")
        .text(ReceiptFooter)
        .newline()
        .encode();
      // Split encoded receipt parts into chunks and push into the array
      const chunkSize = 512; // Maximum allowed size
      const chunks: string[] = [];

      // Function to split encoded data into chunks
      const splitIntoChunks = (encodedData: any) => {
        for (let i = 0; i < encodedData.length; i += chunkSize) {
          const chunk = encodedData.slice(i, i + chunkSize);
          chunks.push(chunk);
        }
      };

      // Push chunks for each part of the receipt
      splitIntoChunks(encodedHeader);
      splitIntoChunks(encodedBody);

      if (!BleClient.initialize()) {
        await initializeBluetooth();
      }
      let deviceId = "";
      // Request Bluetooth device permission if not already requested
      if (!isPermissionRequested()) {
        deviceId = await requestBluetoothPermission();
      }

      for (const chunk of chunks) {
        await printWithBluetooth(chunk, deviceId);
      }
    } catch (error) {
      console.error("Error printing:", error);
    }
  }, [order_list_info, getOrderDate]);
  let permissionRequested = false;

  // Function to check if permission has been requested
  const isPermissionRequested = () => {
    return permissionRequested;
  };

  // Function to set permissionRequested flag
  const setPermissionRequested = (value: any) => {
    permissionRequested = value;
  };
  const handleReceivedPayment = () => {
    // console.log(order_list_info);
    setOpenSearchModal({ isOpen: false, modal: "process" });
    setCanDismiss(true);
    setOpenCashModal(true);
  };
  const handleCloseModal = () => {
    setOpenSearchModal({ isOpen: false, modal: "receipt" });
  };
  const handleCash = (ev: Event) => {
    const target = ev.target as HTMLIonInputElement;
    const query = target.value?.toString() ?? "";
    const cashinput = parseInt(query);

    setTotalCash(cashinput);
  };
  const handleSubmitPayment = useCallback(async () => {
    if (totalCash < getTotalAmount) {
      setTotalCash(0);
      setMessageToast({
        toastMessage: "Credit is not enough",
        isOpen: true,
      });
      return;
    }
    let newItem: Addtocart;
    let payload: Addtocart[] = [];
    order_list_info.order_item.map((val) => {
      let totalDiscount: number = 0.0;
      totalDiscount += val.discount_price;
      console.log(totalDiscount);
      newItem = {
        onhandqty: val?.onhandqty!,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        discount: val.discount_price ?? 0,
        total_discount: totalDiscount,
        image: "",
        orderid: order_list_info.order_info.orderid,
        cartid: order_list_info.order_info.cartid,
        createdAt: order_list_info.order_info.createdat,
        status: order_list_info.order_info.status,
      };
      payload.push(newItem);
    });
    await saveOrder(payload, "Cash", totalCash);
    setOpenSearchModal({ isOpen: false, modal: "process" });
    setCanDismiss(true);
    setOpenCashModal(false);
  }, [order_list_info, getTotalAmount, totalCash]);
  return (
    <div className="oi-root">
      {/* ── Top action bar ── */}
      {getReturnsFromUrl === "false" && (
        <div className="oi-top-bar">
          <button
            className="oi-process-btn"
            onClick={() => {
              setOpenSearchModal({ isOpen: true, modal: "process" });
              setCanDismiss(false);
            }}
          >
            Process
          </button>
        </div>
      )}

      <div className="oi-inner">
        {/* ── Customer info card ── */}
        <div className="oi-card">
          <p className="oi-card-title">Customer</p>
          <div className="oi-row">
            <span className="oi-row-label">Name</span>
            <span className="oi-row-value">
              {order_list_info.order_info.createdby === "system_ai"
                ? "FB_CUSTOMER"
                : order_list_info.order_info?.name}
            </span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Address</span>
            <span className="oi-row-value">
              {order_list_info.order_info.createdby === "system_ai"
                ? "N/A"
                : order_list_info.order_info?.address}
            </span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Contact</span>
            <span className="oi-row-value">
              {order_list_info.order_info.createdby === "system_ai"
                ? "N/A"
                : order_list_info.order_info?.contactno}
            </span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Order Type</span>
            <span className="oi-row-value">{order_list_info.order_info?.type}</span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Date</span>
            <span className="oi-row-value">{getOrderDate}</span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Cashier</span>
            <span className="oi-row-value">{order_list_info.order_info.createdby}</span>
          </div>
          <div className="oi-row">
            <span className="oi-row-label">Order ID</span>
            <span className="oi-row-value">{order_list_info.order_info?.orderid}</span>
            <button className="oi-copy-btn" onClick={() => handleCopy(order_list_info.order_info?.orderid)}>
              <IonIcon icon={copy} />
            </button>
          </div>
          {order_list_info.order_info?.transid?.length! > 0 && (
            <div className="oi-row">
              <span className="oi-row-label">Transaction ID</span>
              <span className="oi-row-value">{order_list_info.order_info?.transid}</span>
              <button className="oi-copy-btn" onClick={() => handleCopy(order_list_info.order_info?.transid!)}>
                <IonIcon icon={copy} />
              </button>
            </div>
          )}
        </div>

        {/* ── Items card ── */}
        <div className="oi-card">
          <p className="oi-card-title">{getReturnsFromUrl === "true" ? "Return Items" : "Order Items"}</p>
          {getReturnsFromUrl === "true" ? (
            Array.isArray(order_list_info.return_item) && order_list_info.return_item.length > 0 ? (
              order_list_info.return_item.map((items, index) => (
                <div key={index} className="oi-item-row">
                  <div className="oi-item-left">
                    <p className="oi-item-name">{items.item}</p>
                    <p className="oi-item-price">&#8369;{items.price.toFixed(2)}</p>
                    <span className="oi-returns-badge">Return/Refund — {items.qty}</span>
                  </div>
                  <div className="oi-item-right">
                    <span className="oi-item-qty">×{items.qty}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#808289", fontFamily: "Gotham-Light", fontSize: 14 }}>No items to display</p>
            )
          ) : (
            Array.isArray(order_list_info.order_item) && order_list_info.order_item.length > 0 ? (
              order_list_info.order_item.map((items, index) => {
                const returnItems = order_list_info.return_item.find(r => r.code === items.code);
                return (
                  <div key={index} className="oi-item-row">
                    <div className="oi-item-left">
                      <p className="oi-item-name">{items.item}</p>
                      <p className="oi-item-meta">{items.brand} · {items.category}</p>
                      <p className="oi-item-price">
                        {items.discount_price > 0 ? (
                          <>
                            <span className="oi-price-original">&#8369;{items.price.toFixed(2)}</span>
                            <span className="oi-price-discounted">
                              &#8369;{(items.price - items.discount_price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>&#8369;{items.price.toFixed(2)}</>
                        )}
                      </p>
                      {returnItems && (
                        <span className="oi-returns-badge">Return/Refund — {returnItems.qty}</span>
                      )}
                    </div>
                    <div className="oi-item-right">
                      <span className="oi-item-qty">×{items.qty}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#808289", fontFamily: "Gotham-Light", fontSize: 14 }}>No items to display</p>
            )
          )}
        </div>

        {/* ── Totals card ── */}
        <div className="oi-card">
          <p className="oi-card-title">{getReturnsFromUrl === "true" ? "Refund Summary" : "Payment Summary"}</p>
          <div className="oi-totals-row">
            <span className="oi-totals-label">Payment Method</span>
            <span className="oi-totals-value">{order_list_info.order_info?.paidthru?.toLocaleUpperCase()}</span>
          </div>
          <div className="oi-totals-row">
            <span className="oi-totals-label">Sub-Total</span>
            <span className="oi-totals-value">&#8369;{order_list_info.order_info?.total?.toFixed(2)}</span>
          </div>
          <div className="oi-totals-row">
            <span className="oi-totals-label">Discount & Vouchers</span>
            <span className="oi-totals-value">&#8369;{getDiscount > 0 ? getDiscount.toFixed(2) : "0.00"}</span>
          </div>
          <div className="oi-totals-row">
            <span className="oi-total-due-label">
              {getReturnsFromUrl === "true" ? "Amount Return" : "Amount Due"}
            </span>
            <span className="oi-total-due-value">&#8369;{getTotalAmount?.toFixed(2)}</span>
          </div>
          {getReturnsFromUrl !== "true" && (
            (order_list_info.order_info?.paidcash > 0 || order_list_info.order_info?.paidthru === "Cash") ? (
              <>
                <div className="oi-totals-row">
                  <span className="oi-totals-label">Cash</span>
                  <span className="oi-totals-value">&#8369;{order_list_info.order_info?.paidcash?.toFixed(2)}</span>
                </div>
                <div className="oi-totals-row">
                  <span className="oi-totals-label">Change</span>
                  <span className="oi-totals-value">
                    &#8369;{(order_list_info.order_info?.paidcash - getTotalAmount > 0
                      ? order_list_info.order_info?.paidcash - getTotalAmount
                      : 0
                    ).toFixed(2)}
                  </span>
                </div>
              </>
            ) : null
          )}
          {getReturnsFromUrl === "true" && order_list_info.return_item[0]?.remarks && (
            <div className="oi-totals-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span className="oi-totals-label">Remarks</span>
              <span className="oi-remarks-text">{order_list_info.return_item[0]?.remarks}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="oi-action-bar">
        {order_list_info.order_info?.paidthru?.toLowerCase() === "quotation" && (
          <button
            className="oi-action-btn oi-btn-outline"
            onClick={() =>
              setIsOpenToast({ isOpen: true, type: "quotation-email", toastMessage: "Sending Email" })
            }
          >
            <IonIcon icon={print} />
            Quotation
          </button>
        )}
        {order_list_info.order_info?.paidthru?.toLowerCase() === "cash" &&
          order_list_info?.return_item.length === 0 && (
            <button className="oi-action-btn oi-btn-danger" onClick={handleRefund}>
              <IonIcon icon={cashOutline} />
              Refund
            </button>
          )}
        <button className="oi-action-btn oi-btn-close" onClick={handleClose}>
          <IonIcon icon={close} />
          Close
        </button>
      </div>

      {/* ── Process modal ── */}
      <IonModal
        isOpen={openSearchModal.modal === "process" ? openSearchModal.isOpen : false}
        initialBreakpoint={0.75}
        breakpoints={[0, 0.75, 1]}
        canDismiss={modalDismiss}
      >
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonButtons slot="start">
              <IonButton onClick={() => { setOpenSearchModal({ isOpen: false, modal: "process" }); setCanDismiss(true); }}>
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">Actions</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {getReturnsFromUrl === "false" && (
            <div className="oi-process-modal-body">

              {/* ─ Cancelled order ─ */}
              {order_list_info.order_info?.paidthru?.toLowerCase() === "cancel" && (
                <>
                  <p className="oi-process-section-label">Order Actions</p>
                  <button className="oi-modal-btn" onClick={() => handleEdit(true)}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={refreshOutline} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Reorder</span>
                      <span className="oi-modal-btn-sub">Recreate this cancelled order</span>
                    </span>
                  </button>
                </>
              )}

              {/* ─ Pending / Quotation ─ */}
              {(order_list_info.order_info?.paidthru?.toLowerCase() === "pending" ||
                order_list_info.order_info?.paidthru?.toLowerCase() === "quotation") && (
                  <>
                    <p className="oi-process-section-label">Order Actions</p>
                    <button className="oi-modal-btn" onClick={() => handleEdit(false)}>
                      <span className="oi-modal-btn-icon"><IonIcon icon={pencilOutline} /></span>
                      <span className="oi-modal-btn-text">
                        <span className="oi-modal-btn-label">Edit Order</span>
                        <span className="oi-modal-btn-sub">Modify items or details</span>
                      </span>
                    </button>
                    <button className="oi-modal-btn" onClick={handleApprove}>
                      <span className="oi-modal-btn-icon"><IonIcon icon={checkmarkCircleOutline} /></span>
                      <span className="oi-modal-btn-text">
                        <span className="oi-modal-btn-label">Process Order</span>
                        <span className="oi-modal-btn-sub">Approve and move to processing</span>
                      </span>
                    </button>
                    {order_list_info.order_info?.paidthru?.toLowerCase() === "pending" && (
                      <button className="oi-modal-btn" onClick={handleCancel}>
                        <span className="oi-modal-btn-icon"><IonIcon icon={closeCircleOutline} /></span>
                        <span className="oi-modal-btn-text">
                          <span className="oi-modal-btn-label">Cancel Order</span>
                          <span className="oi-modal-btn-sub">Void this order</span>
                        </span>
                      </button>
                    )}
                  </>
                )}

              {/* ─ Delivered ─ */}
              {order_list_info.order_info?.status?.toLowerCase() === "delivered" && (
                <>
                  <p className="oi-process-section-label">Documents</p>
                  <button className="oi-modal-btn" onClick={handlePrintInvoice}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={print} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Print Invoice</span>
                      <span className="oi-modal-btn-sub">Send to connected printer</span>
                    </span>
                  </button>
                  <button className="oi-modal-btn" onClick={() => setOpenSearchModal({ isOpen: true, modal: "receipt" })}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={documentTextOutline} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Invoice as PDF</span>
                      <span className="oi-modal-btn-sub">View or share PDF invoice</span>
                    </span>
                  </button>
                  <button className="oi-modal-btn" onClick={() => setOpenSearchModal({ isOpen: true, modal: "" })}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={bicycleOutline} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Open Delivery Info</span>
                      <span className="oi-modal-btn-sub">View delivery details</span>
                    </span>
                  </button>
                  {order_list_info.order_info?.paidthru?.toLowerCase() === "debt" && (
                    <button className="oi-modal-btn" onClick={handleReceivedPayment}>
                      <span className="oi-modal-btn-icon"><IonIcon icon={cashOutline} /></span>
                      <span className="oi-modal-btn-text">
                        <span className="oi-modal-btn-label">Receive Payment</span>
                        <span className="oi-modal-btn-sub">Mark outstanding balance as paid</span>
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* ─ Approved ─ */}
              {order_list_info.order_info?.status === "approved" && (
                <>
                  <p className="oi-process-section-label">Documents</p>
                  <button className="oi-modal-btn" onClick={handlePrintInvoice}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={print} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Print Invoice</span>
                      <span className="oi-modal-btn-sub">Send to connected printer</span>
                    </span>
                  </button>
                  <button className="oi-modal-btn" onClick={() => setOpenSearchModal({ isOpen: true, modal: "receipt" })}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={documentTextOutline} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Invoice as PDF</span>
                      <span className="oi-modal-btn-sub">View or share PDF invoice</span>
                    </span>
                  </button>
                  <p className="oi-process-section-label">Fulfillment</p>
                  <button className="oi-modal-btn" onClick={() => router.push(`/deliveryInfo?orderid=${order_list_info.order_info.orderid}&transid=${order_list_info.order_info.transid}&cartid=${order_list_info.order_info.cartid}`)}>
                    <span className="oi-modal-btn-icon"><IonIcon icon={bicycleOutline} /></span>
                    <span className="oi-modal-btn-text">
                      <span className="oi-modal-btn-label">Process Item Delivered</span>
                      <span className="oi-modal-btn-sub">Confirm delivery & upload proof</span>
                    </span>
                  </button>
                  {order_list_info.order_info?.paidthru?.toLowerCase() === "debt" && (
                    <button className="oi-modal-btn" onClick={handleReceivedPayment}>
                      <span className="oi-modal-btn-icon"><IonIcon icon={cashOutline} /></span>
                      <span className="oi-modal-btn-text">
                        <span className="oi-modal-btn-label">Receive Payment</span>
                        <span className="oi-modal-btn-sub">Mark outstanding balance as paid</span>
                      </span>
                    </button>
                  )}
                </>
              )}

            </div>
          )}
        </IonContent>
      </IonModal>

      {/* ── Delivery info modal ── */}
      <IonModal
        isOpen={openSearchModal.modal !== "receipt" && openSearchModal.modal !== "process" ? openSearchModal.isOpen : false}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleCloseModal}>Close</IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">Delivery Information</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {order_list_info?.order_info?.status?.toLowerCase() === "delivered" && (
            <div className="delivery-image-container">
              <div className="oi-delivery-block">
                <span className="oi-delivery-line">Delivered by: {getGetDeliveryInfo.deliveredby}</span>
                <span className="oi-delivery-line">
                  Delivered at: {format(new Date(getGetDeliveryInfo.deliverydate).toISOString(), "MMMM dd, yyyy hh:mm a")}
                </span>
                <span className="oi-delivery-line">
                  Time Elapsed: {elapsedTime.hour}h {elapsedTime.minute}m
                </span>
              </div>
              {getFile?.contentType?.startsWith("image/") && (
                <>
                  <p className="delivery-image-text">Delivery Image</p>
                  <IonImg className="oi-delivery-image" src={"data:image/png;base64," + getFile.fileContents} />
                </>
              )}
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* ── Invoice PDF modal ── */}
      <IonModal
        isOpen={openSearchModal.modal === "receipt" ? openSearchModal.isOpen : false}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => setOpenSearchModal({ isOpen: false, modal: "receipt" })}>Close</IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">Invoice</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpenToast({ isOpen: true, type: "receipt-email", toastMessage: "" })}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div ref={invoiceRef} id="receipt">
            <div className="oi-invoice-header-logo"><img src={logo} alt="logo" /></div>
            <p className="oi-invoice-store-name">Restie Hardware</p>
            <p className="oi-invoice-store-address">SIR Bucana 76-A, Sandawa Matina Davao City</p>
            <p className="oi-invoice-store-address">Contact No.: (082) 224 1362</p>
            <hr className="oi-invoice-divider" />
            <div className="oi-card" style={{ boxShadow: "none", padding: "0", marginBottom: 8 }}>
              {[
                ["Invoice #", order_list_info.order_info?.transid?.split("-")[0]],
                ["Customer", order_list_info.order_info.createdby === "system_ai" ? "FB_CUSTOMER" : order_list_info.order_info?.name],
                ["Address", order_list_info.order_info?.address],
                ["Contact", order_list_info.order_info?.contactno],
                ["Order Type", order_list_info.order_info?.type],
                ["Date", getOrderDate],
                ["Cashier", order_list_info.order_info.createdby],
              ].map(([label, value], i) => (
                <div key={i} className="oi-row">
                  <span className="oi-row-label">{label}</span>
                  <span className="oi-row-value">{value}</span>
                </div>
              ))}
            </div>
            <hr className="oi-invoice-divider" />
            {Array.isArray(order_list_info.order_item) && order_list_info.order_item.map((items, index) => (
              <div key={index} className="oi-item-row">
                <div className="oi-item-left">
                  <p className="oi-item-name">{items.item}</p>
                  <p className="oi-item-meta">{items.brand} · {items.category}</p>
                  <p className="oi-item-price">
                    &#8369;{items.price.toFixed(2)}
                    {items.discount_price > 0 && <> — disc. &#8369;{items.discount_price.toFixed(2)}</>}
                  </p>
                </div>
                <div className="oi-item-right">
                  <span className="oi-item-qty">×{items.qty}</span>
                </div>
              </div>
            ))}
            <hr className="oi-invoice-divider" />
            <div className="oi-totals-row">
              <span className="oi-totals-label">Payment</span>
              <span className="oi-totals-value">{order_list_info.order_info.paidthru.toLocaleUpperCase()}</span>
            </div>
            <div className="oi-totals-row">
              <span className="oi-totals-label">Sub-Total</span>
              <span className="oi-totals-value">&#8369;{order_list_info.order_info.total.toFixed(2)}</span>
            </div>
            <div className="oi-totals-row">
              <span className="oi-totals-label">Discount</span>
              <span className="oi-totals-value">{getDiscount > 0 ? `${getDiscount}%` : "—"}</span>
            </div>
            <div className="oi-totals-row">
              <span className="oi-total-due-label">Amount Due</span>
              <span className="oi-total-due-value">&#8369;{getTotalAmount.toFixed(2)}</span>
            </div>
            {order_list_info.order_info?.paidcash > 0 && (
              <>
                <div className="oi-totals-row">
                  <span className="oi-totals-label">Cash</span>
                  <span className="oi-totals-value">&#8369;{order_list_info.order_info.paidcash.toFixed(2)}</span>
                </div>
                <div className="oi-totals-row">
                  <span className="oi-totals-label">Change</span>
                  <span className="oi-totals-value">&#8369;{(order_list_info.order_info.paidcash - getTotalAmount).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </IonContent>
      </IonModal>

      {/* ── Email modal ── */}
      <IonModal
        id="email-modal"
        isOpen={
          (isOpenToast.type === "receipt-email" || isOpenToast.type === "quotation-email")
            ? isOpenToast.isOpen
            : false
        }
        onDidDismiss={() =>
          setIsOpenToast({ isOpen: false, type: isOpenToast.type === "quotation-email" ? "quotation-email" : "receipt-email", toastMessage: "" })
        }
      >
        <div className="oi-email-wrapper">
          <p className="oi-email-header">
            {isOpenToast.type === "quotation-email"
              ? "Send quotation to customer's email"
              : "Send receipt to customer's email"}
          </p>
          <IonInput
            className="oi-email-input"
            type="email"
            value={getEmail}
            placeholder="email@gmail.com"
            label="Customer's Email"
            labelPlacement="floating"
            onIonInput={(e) => handleSetEmail(e)}
          />
          <button
            className="oi-email-submit-btn"
            onClick={() =>
              isOpenToast.type === "quotation-email" ? handlePrintQuotation() : downloadPDF()
            }
          >
            Submit
          </button>
        </div>
      </IonModal>

      {/* ── Cash payment modal ── */}
      <IonModal
        isOpen={openCashModal}
        onDidDismiss={() => setOpenCashModal(false)}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => setOpenCashModal(false)}>Close</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={handleSubmitPayment}>Pay</IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">Cash</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="oi-cash-modal-body">
            <div className="oi-cash-due-row">
              <span className="oi-cash-due-label">Amount Due</span>
              <span className="oi-cash-due-value">&#8369;{getTotalAmount?.toFixed(2)}</span>
            </div>
            <IonInput
              className="oi-cash-input"
              label="Cash"
              type="number"
              value={totalCash}
              placeholder="0.00"
              onIonInput={(e) => handleCash(e)}
            />
          </div>
        </IonContent>
      </IonModal>

      <IonLoading
        isOpen={
          isOpenToast?.type === "receipt-email" || isOpenToast?.type === "quotation-email"
            ? false
            : isOpenToast?.isOpen
        }
        message={isOpenToast?.toastMessage}
        spinner="circles"
        onDidDismiss={() => setIsOpenToast((prev) => ({ ...prev, isOpen: false }))}
      />
      <IonToast
        isOpen={isOpenMessageToast?.isOpen}
        message={isOpenMessageToast.toastMessage}
        position="middle"
        color="medium"
        duration={3000}
        onDidDismiss={() => setMessageToast({ toastMessage: "", isOpen: false })}
      />
    </div>
  );
};

export default OrderInfoComponent;
