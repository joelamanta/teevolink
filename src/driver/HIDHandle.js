/*
2025.09.02 导入配置的结束地址修改为当前鼠标里面的有效长度
*/


//键盘按键转HID值
import HIDKey from './HIDKey';
//电池优化
import BatteryHandle from './BatteryHandle';
//数据转换
import UserConvert from './UserConvert';

//浏览模式，有USB连接过程，但是没有USB数据收发
var visit = true; 

/*  */
var Command = {
  EncryptionData:1,//下传加密沟通数据
  PCDriverStatus:2,//下传驱动状态的命令（驱动是否处于窗口激活状态）
  DeviceOnLine:3,//获取无线鼠标是否在线
  BatteryLevel:4, //获取电池电量
  DongleEnterPair:5,//设置无线Dongle进入配对状态
  GetPairState:6,//获取无线Dongle配对结果
  WriteFlashData:7,//设置eeprom内容
  ReadFlashData:8,//获取eeprom内容
  ClearSetting:9,//恢复出厂设置
  StatusChanged:0x0A,//上报鼠标某些状态改变，如DPI等
  SetDeviceVidPid:0x0B,//设置Dongle的USB VID/PID
  SetDeviceDescriptorString:0x0C,//设置Dongle的USB设备描述字符串
  EnterUsbUpdateMode:0x0D,//进入USB升级模式
  GetCurrentConfig:0x0E,//获取当前配置
  SetCurrentConfig:0x0F,//设置当前配置
  ReadCIDMID:0x10,//获取鼠标CID/mid
  EnterMTKMode:0x11,//设置无线Dongle进入EMI/MTK测试模式
  ReadVersionID:0x12,//获取鼠标版本号

  Set4KDongleRGB:0x14,//设置4K dongle RGB灯模式,dongle上有个rgb灯（不是在鼠标上）
  Get4KDongleRGBValue:0x15,//获取4K dongle RGB灯模式
  SetLongRangeMode:0x16,//设置远距离模式
  GetLongRangeMode:0x17,//获取远距离模式
  SetDongleRGBBarMode:0x18,//设置dongle灯带模式
  GetDongleRGBBarMode:0x19,//获取dongle灯带模式  

  GetDongleVersion:0x1D,//获取dongle版本

  SetDongle3RGBMode:0x2C,//设置dongle 3个RGB灯模式
  GetDongle3RGBMode:0x2D,//获取dongle 3个RGB灯模式  

  MusicColorful:0xB0,//音乐律动全彩
  MusicSingleColor:0xB1,//音乐律动全键单色

  WriteKBCIdMID:0xF0,//读取cid mid,cx53710专用
  ReadKBCIdMID:0xF1,//读取cid mid,cx53710专用
}

//鼠标EEPROM起始地址
var MouseEepromAddr = {
  ReportRate:0x00,//报告率
  maxDpiStage:0x02,//最大DPI档位
  CurrentDPI:0x04,//当前DPI档位
  LOD:0x0A,//LOD高度
  DPIValue:0x0C,//第一档DPI值
  DPIColor:0x2C,//第一档DPI颜色
  DPIEffectMode:0x4C,//DPI灯效
  DPIEffectBrightness:0x4E,//DPI灯效亮度
  DPIEffectSpeed:0x50,//DPI灯效亮度
  DPIEffectState:0x52,//DPI灯效亮度
  Light:0xA0,//装饰灯
  DebounceTime:0xA9,//按钮消抖
  MotionSync:0xAB,
  SleepTime:0xAD,//休眠时间
  Angle:0xAF,
  Ripple:0xB1,
  MovingOffLight:0xB3,
  PerformanceState:0xB5,
  Performance:0xB7,
  SensorMode:0xB9,
  AngleTune:0xBD,
  AngleTuneState:0xBF,    
  SensorFPS20K:0xE1,
  KeyFunction:0x60,
  ShortcutKey:0x0100,
  Macro:0x0300,
}

//鼠标按键功能
var MouseKeyFunction = {
  Disable:0x00,
  MouseKey:0x01,
  LeftKey:0x0100,
  DPISwitch:0x02,
  LeftRightRoll:0x03,
  FireKey:0x04,
  ShortcutKey:0x05,
  Macro:0x06,
  ReportRateSwitch:0x07,
  LightSwitch:0x08,
  ProfileSwitch:0x09,
  DPILock:0x0A,
  UpDownRoll:0x0B
}

//配对状态
var DevicePairResult = {
  Pairing:0x01,
  Fail:0x02,
  Success:0x03,
}

var DeviceConectState = {
  Disconnected:0x00,
  Connecting:0x01,
  Connected:0x02,
  TimeOut:0x03
}

var on = true;
var off = false;

var ReportId = 0x08;
var devicePID;

var device;
var historyDevices = [];
var historyDevicesInfos = [];
var receivedData = [];
var sendingFlag = false;
var flashData = new Uint8Array(0x2000).fill(0);
var flashEndAddress = 0;

//获取设备超时定时器
var getFlashTimerID;
var getFlashTimerTickCount = 0;
//查询是否在线定时器
var onlineTimerID;
//查询电池定时器
var batteryTimerID;
//查询配对状态定时器
var pairTimerID;

//配对结果
var pairResult = {
  pairStatus : 0,
  pairLeftTime : 20,
};

var getCurrentPorfileFlag = false;
var setCurrentPorfileFlag = false;
var getPairResultTimeCount = 0;

//是否需要获取电量
var getBatteryFlag = false;
var driverOnlineFlag = false;

var deviceInfo = {
  deviceOpen:false,
  connectState:DeviceConectState.Disconnected,//Device connect state
  online:false,//设备在不在线
  addr:[],//设备地址
  info:{
    cid:1,//设备的CID，MID
    mid:1,
    type:1//设备类型 0:dongle_1K, 1:dongle_4K, 2:有线_1K  3:有线_4K
  },
  pairCID:0,
  type:"mouse",//当前设备类型：
  isWired:false,//设备是有线还是无线
  maxReportRate:1000,//该设备最大报告率
  battery:{
    level:20,//电量百分比
    charging:false,//0：没充电 1：充电中
    voltage:0x0E90,//电池电压
  },
  batteryOptimizeInit:false,
  batteryOptimize:false,//是否开启电池优化
  version:{
    dongle:"v1.0",//接收器版本
    device:"--",//设备版本
  },
  supportChangeProfile:false,//是否可以切换报告率
  profile:0,//设备当前选择的配置
  isRestoring:false,//是否正在恢复出厂设置
  showOfflineDialog:false,//设备不在线的时候显示是否需要显示不在线窗体
  dongle4KRGB: {
    mode:0,
    color1:'rgb(255,0,0)',
    color2:'rgb(255,0,0)',
    color3:'rgb(255,0,0)',
  },
  defaultDongle4KRGB:{
     mode:0,
     color1:'rgb(255,0,0)',
     color2:'rgb(255,0,0)',
     color3:'rgb(255,0,0)',   
  },
  dongleRGBBar: {
    mode:0,
    color:'rgb(255,0,0)',
    speed:3,
    brightness:3,
    time:1
  },
  dongle3LEDRGB: {
    mode:[]
  },
  defaultDongleRGBBar: {
    mode:0,
    color:'rgb(255,0,0)',
    speed:3,
    brightness:3,
    time:1    
  },
  mouseCfg : {//鼠标配置
    reportRate:1,//回报率
    maxDpiStage:4,//最大DPI
    currentDpi:2,//当前DPI
    xSpindown:0,//
    ySpindown:0,//
    debounceTime:8,//按键防抖时间
    supportLongDistance:true,//是否支持远距离模式
    longDistance:false,//远距离模式
    defaultLongDistance:false,//默认远距离模式，恢复出厂设置的时候需要下传USB
    supportAngleTune:true,
    angleTune:0x00,//0XE2: -30 degree
                  //0XF6: -10 degree
                  //0X00:  0 degree
                  //0X0F: +15 degree
                  //0X1E: +30 degree     
    angleTuneState:0,//0: Angle tune disable(default) 1:Angle tune enable        
    sensor:{//sensor的配置
      cfg:{},//读取sensor.json中当前sensor的配置，包括range,value(可能没有)
      type:"3950",//sensor型号
      lod:1,//lod参数
      motionSync:false,//motionSync
      angle:false,//直线修正
      ripple:false,//波纹控制
      performanceState:false,//火力全开状态
      performance:6,//火力全开时间
      sensorMode:0,//sensor模式
      fps20k:0,//only NRF54
    },
    dpis:[//DPI的配置
      {
        value:400,//DPI值
        color:"#ff0000"//DPI颜色
      },
      {
        value:800,
        color:"#00ff00"
      },
      {
        value:1600,
        color:"#0000ff"
      },
      {
        value:3200,
        color:"#ff00ff"
      },
      {
        value:400,
        color:"#ff0000"
      },
      {
        value:400,
        color:"#ff0000"
      },
      {
        value:400,
        color:"#ff0000"
      },
      {
        value:400,
        color:"#ff0000"
      },
    ],
    dpiEffect:{//DPI灯效配置
      mode:1,//1.常亮；2.呼吸
      state:on,//DPI灯效开关，off：关，on：开
      brightness:3,//亮度
      speed:3,//速度
    },
    lightEffect:{//灯光灯效配置
      mode:2,
      /*
      0x00: 关闭（不支持调速，不支持调亮度，不支持调颜色）
      0X01: 彩色流动（默认）（支持调速、调亮度，不支持调颜色）
      0X02: 单色呼吸（支持调速、调亮度、调颜色）
      0X03: 单色常亮（支持调亮度、颜色，不支持调速度）
      0X04: 霓虹（支持调速、调亮度，不支持调颜色）
      0X05: 混彩呼吸（支持调速、调亮度，不支持调颜色）
      0X06: 炫彩常亮（支持调速、调亮度，不支持调颜色）
      */
      brightness:3,//亮度
      speed:3,//速度
      color:"#ff0000",//装饰灯颜色
      state:on,//DPI灯效开关，off：关，on：开    
      movingOffState:false,//移动时关闭指示灯
    },
    sleepTime:3,//休眠时间和放停时关闭装饰灯
    keysCount:6,//鼠标的按键个数
    keys:[//按键配置
      {
        value:["1","0x0001"]
      },
      {
        value:["1","0x0002"]
      },
      {
        value:["1","0x0004"]
      },
      {
        value:["1","0x0010"]
      },
      {
        value:["1","0x0008"]
      },
      {
        value:["2","0x0001"]
      },
      {
        value:["2","0x0002"]
      },
      {
        value:["2","0x0003"]
      },
    ],
    shortCutKey:[//快捷键
    /*
    isMedia : false,true:是多媒体键，false：快捷键
    contexts : [
    {
      status：按键状态：0为按下，1为抬起
      type：按键类型
      value：按键值
    },
    {
      status：按键状态：0为按下，1为抬起
      type：按键类型
      value：按键值
    },],
    */
    ],
    macros:[//宏
    /*
    macro = {
    name:name,
    contexts:[
    {
      status：按键状态：0为按下，1为抬起
      type：按键类型
      value：按键值
    },
    {
      status：按键状态：0为按下，1为抬起
      type：按键类型
      value：按键值
    },
    ]}
    */
    ]
  }  
}

/*
请求设备连接，filters参数如下：
var filter = {
  vendorId: Number.parseInt(vid),
  productId: Number.parseInt(pid),
}
filters.push(filter);

return true:设备连接
       false：设备未连接
*/
async function Request_Device(filters) {
  const devices = await navigator.hid.requestDevice({filters});
  if(devices.length == 0)
    return false;

  let connectDevices  = JSON.parse(localStorage.getItem('hidDevices')) || [];

  var connect = false;
  for(let temp of devices) {
    if(visit) {
      connect = visit;
      break;
    }

    //判断连接设备的端口是否符合要求
    for(let i = 0;i < temp.collections.length;i++) {
      if(temp.collections[i].inputReports.length === 1 && 
          temp.collections[i].outputReports.length === 1) {
          //只识别ReportId为0x08的设备
          if(ReportId == temp.collections[i].outputReports[0].reportId) {
            device = temp;

            if(connectDevices.length == 0) {
              connectDevices.push(device.productName);
              localStorage.setItem('hidDevices', JSON.stringify(connectDevices));
            }
            else {
              if (!connectDevices.includes(device.productName)) {
                connectDevices.push(device.productName);
                localStorage.setItem('hidDevices', JSON.stringify(connectDevices));
              }
            }

            console.log("hidDevices",JSON.stringify(connectDevices))

            if(!device.opened)
            {
              await device.open();
            } 
            deviceInfo.version.dongle = "--";
            deviceInfo.deviceOpen = true;
            read_HID_Buffer();
          
            devicePID = device.vendorId;
            Device_Disconnect();
            connect = true;

            await Get_Device_Info();
            console.log('requestDevice:',device,deviceInfo);
            break;  
          }
        }
    }    
  }
  return connect;
}

//设备连接
async function Device_Connect() {
  if(visit == false) {
    if(deviceInfo.isWired == false) {
      await Get_Dongle_Param();
    }

    if(await Get_Online_Interval() == false) {
      onlineTimerID = setInterval(Get_Online_Interval,1500);
    }  
  }
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (typeof obj1!== 'object' || obj1 === null || typeof obj2!== 'object' || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length!== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (!keys2.includes(key) ||!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

async function Get_HistoryDevicesInfo() {
  const connectDevices = JSON.parse(localStorage.getItem('hidDevices'));

  const devices = await navigator.hid.getDevices();

  if(devices.length == 0) {
    historyDevicesInfos = [];
    return historyDevicesInfos;
  }

  var equal = true;

  if (historyDevices.length !== devices.length) {
    equal = false;
  }
  else {
    equal = historyDevices.every((item, index) => deepEqual(item, devices[index]));
  }

  if(equal == false) {
    historyDevicesInfos = [];
    historyDevices = devices;
    for(let j = 0;j < devices.length;j++) {
      let temp = devices[j];
      for(let i = 0;i < temp.collections.length;i++){
        if(temp.collections[i].inputReports.length === 1 && 
          temp.collections[i].outputReports.length === 1){
          //只识别ReportId为0x08的设备
          if(ReportId == temp.collections[i].outputReports[0].reportId) {
            device = temp;
  
            if(!device.opened) {
              await device.open();
            } 
          
            deviceInfo.deviceOpen = true;
            read_HID_Buffer();
  
            const info = await Get_Device_Info();
            var isWired = false;
            var reportRate = 1000;
            // 设备类型 
            // 0:dongle_1K, 
            // 1:dongle_4K, 
            // 2:有线_1K  
            // 3:有线_8K 
            // 4:dongle_2K 
            // 5:dongle_8K
            if(info.type == 0x02) {
              isWired = true;
              reportRate = 1000;
            }
            else if(info.type == 0x03) {
              isWired = true;
              reportRate = 8000;
            }
            else {
              isWired = false;
              if(info.type == 0x00) {
                reportRate = 1000;
              }
              else if(info.type == 0x01) {
                reportRate = 4000;
              }
              else if(info.type == 0x04) {
                reportRate = 2000;
              }
              else if(info.type == 0x05) {
                reportRate = 8000;
              }
            }

            var online = await Get_Device_Online();
            const historyDeviceInfo = {
              device : temp,
              cid : info.cid,
              mid : info.mid,
              isWired : isWired,
              reportRate : reportRate,
              online : online,
            }
            historyDevicesInfos.push(historyDeviceInfo);
            break;
          }
        }   
      }     
    } 
    console.log("Device_Reconnect",connectDevices,devices,historyDevicesInfos);
  }
  else {
    for(let i = 0;i < historyDevicesInfos.length;i++) {
      let temp = historyDevicesInfos[i].device;
      device = temp;
      
      if(!device.opened) {
        await device.open();
      } 
    
      deviceInfo.deviceOpen = true;
      read_HID_Buffer();

      var online = await Get_Device_Online();
      historyDevicesInfos[i].online = online;
    }
  }

  return historyDevicesInfos;
}

//回连设备
async function Device_Reconnect(temp) {
  device = temp;

  if(!device.opened)
  {
    await device.open();
  } 

  deviceInfo.deviceOpen = true;
  read_HID_Buffer();

  devicePID = device.vendorId;
  Device_Disconnect();

  await Get_Device_Info();
  console.log('requestDevice:',device,deviceInfo);
}

//设备退出
function Handle_Exit() {
  if(pairTimerID) {
    clearInterval(pairTimerID);
  }

  if(batteryTimerID) {
    clearInterval(batteryTimerID);
  }

  if(onlineTimerID) {
    clearInterval(onlineTimerID);
  }

  if(getFlashTimerID) {
    clearInterval(getFlashTimerID);
  }

  BatteryHandle.batteryHandleExit();
  deviceInfo.batteryOptimize = false;
  deviceInfo.batteryOptimizeInit = false;
  deviceInfo.deviceOpen = false;
}

//设备主动断开，例如拔出设备
function Device_Disconnect() {
  navigator.hid.ondisconnect = (event) => {
    Handle_Exit();
  } 
}

//驱动断开设备，如驱动关闭
async function Device_Close(){
  if(typeof driverOnlineFlag != "undefined") {
    if(driverOnlineFlag)
      await Set_PC_Satae(0); //网页驱动版本现在不需要了
  }

  Handle_Exit();
  if(visit == false) {
    if(typeof device != 'undefined')     
      device.close();
  }
}

//读USB设备上传的数据
function read_HID_Buffer() {
  device.oninputreport = async (event) => {
    if(event.reportId === ReportId) {
      receivedData = new Uint8Array(event.data.buffer);

      let command = receivedData[0];

      if(receivedData[1] == 0){
        switch(command){
          //获取设备的cid,mid和设备类型
          case Command.EncryptionData:
            deviceInfo.info.cid = receivedData[9];
            deviceInfo.info.mid = receivedData[10];
            deviceInfo.info.type = receivedData[11];
            // 设备类型 
            // 0:dongle_1K, 
            // 1:dongle_4K, 
            // 2:有线_1K  
            // 3:有线_8K 
            // 4:dongle_2K 
            // 5:dongle_8K
            if(deviceInfo.info.type == 0x02) {
              deviceInfo.isWired = true;
              deviceInfo.maxReportRate = 1000;
            }
            else if(deviceInfo.info.type == 0x03) {
              deviceInfo.isWired = true;
              deviceInfo.maxReportRate = 8000;
            }
            else {
              deviceInfo.isWired = false;
              if(deviceInfo.info.type == 0x00) {
                deviceInfo.maxReportRate = 1000;
              }
              else if(deviceInfo.info.type == 0x01) {
                deviceInfo.maxReportRate = 4000;
              }
              else if(deviceInfo.info.type == 0x04) {
                deviceInfo.maxReportRate = 2000;
              }
              else if(deviceInfo.info.type == 0x05) {
                deviceInfo.maxReportRate = 8000;
              }
            }
            break;

          //驱动状态
          case Command.PCDriverStatus:
            break;

          //设备是否在线
          case Command.DeviceOnLine:
            deviceInfo.online = receivedData[5];
            deviceInfo.addr.length = 3;
            deviceInfo.addr[2] = receivedData[6];
            deviceInfo.addr[1] = receivedData[7];
            deviceInfo.addr[0] = receivedData[8];
            break;

          //电池电量
          case Command.BatteryLevel:
            deviceInfo.battery.level = receivedData[5];
            deviceInfo.battery.charging = receivedData[6] == 1;
            deviceInfo.battery.voltage = (receivedData[7] << 8) + receivedData[8];
            //电池优化
            if(deviceInfo.batteryOptimize == false) {
              if(deviceInfo.batteryOptimizeInit == false)
                BatteryHandle.batteryHandleInit(deviceInfo.addr,deviceInfo.battery);
              deviceInfo.batteryOptimizeInit = true;
              BatteryHandle.setDisplayLevel(deviceInfo.battery);
              deviceInfo.battery.level = BatteryHandle.getDisplayLevel();
              deviceInfo.batteryOptimize = true;
            }
            else {
              BatteryHandle.setDisplayLevel(deviceInfo.battery);
              //console.log("setDisplayLevel:",deviceInfo.battery,BatteryHandle.getDisplayLevel());
              deviceInfo.battery.level = BatteryHandle.getDisplayLevel();
            }
            break;

          case Command.DongleEnterPair:
            getBatteryFlag = false;
            getPairResultTimeCount = 0;
            //设备进入对码模式之后需要开启定时监测配对结果
            pairTimerID = setInterval(Get_Device_PairResult,1000);
            break;

          case Command.GetPairState:
            //配对结果
            pairResult.pairStatus = receivedData[5];
            pairResult.pairLeftTime = receivedData[6];

            if(pairResult.pairStatus == DevicePairResult.Fail || 
              pairResult.pairStatus == DevicePairResult.Success) {
                if(deviceInfo.connectState == DeviceConectState.Connected)
                  getBatteryFlag = true;
                if(pairTimerID) {
                  clearInterval(pairTimerID);
                }
              }
            break;

          case Command.WriteFlashData:
            var addr = 0;
            addr = (receivedData[3] << 8) + receivedData[4];
            var len = receivedData[4];  
            break;

          case Command.ReadFlashData:
            var addr = 0;
            addr = (receivedData[2] << 8) + receivedData[3];
            var len = receivedData[4];

            for(var i = 0;i < len;i++) {
              flashData[addr + i] = receivedData[5 + i]; 
            }  
            
            if (((addr == MouseEepromAddr.ReportRate) && (len == 2)) || 
                ((addr == MouseEepromAddr.CurrentDPI) && (len == 2)) ||
                ((addr == MouseEepromAddr.DPIEffectMode) && (len == 8)) || 
                ((addr == MouseEepromAddr.Light) && (len == 7))) 
            {
              Update_Mouse_Info();
            }
            break;

          case Command.ClearSetting:
            deviceInfo.isRestoring = false;
            break;

          case Command.StatusChanged:
            var value = receivedData[5];

            //DPI档位变化，需要获当前DPI的配置
            if((value & 0x01) == 0x01) {
              Get_MS_CurrentDPI();
            }

            //报告率变化，需要当前报告率的配置
            if((value & 0x02) == 0x02) {
              Get_MS_ReportRate();
            }

            //配置变化，需要获取鼠标的所有设置,与打开驱动时同步鼠标的设置操作一样
            if((value & 0x04) == 0x04) {
              if(getCurrentPorfileFlag == false && setCurrentPorfileFlag == false) {
                getCurrentPorfileFlag = true;
                await Get_Device_Profile();
              }
            }

            //DPI指示灯变化，需要获取DPI指示灯的配置
            if((value & 0x08) == 0x08) {
              Get_MS_DPILightEffect();
            }

            //LOGO指示灯状态改变，需要获取LOGO灯的配置
            if((value & 0x10) == 0x10) {

            }

            //灯带状态改变，需要获取灯带的配置
            if((value & 0x20) == 0x20) {
              Get_MS_Light();
            }

            //电量百分比发生改变，需要获取电量
            if((value & 0x40) == 0x40) {
              Get_Device_Battery();
            }

            //保留
            if((value & 0x80) == 0x80) {

            }
            break;

          case Command.GetCurrentConfig:
            deviceInfo.supportChangeProfile = true;
            deviceInfo.profile = receivedData[5];

            if(visit == false && getCurrentPorfileFlag) {
              getCurrentPorfileFlag = false;
              await Read_Mouse_Flash();
              deviceInfo.connectState = DeviceConectState.Connected;
            }
            break;

           case Command.SetCurrentConfig:

            break;
            
          case Command.ReadVersionID:
            var version = "v" + receivedData[5].toString()
            + "." + receivedData[6].toString(16).padStart(2, '0');
            deviceInfo.version.device = version;
            break; 

          case Command.Set4KDongleRGB:
            deviceInfo.dongle4KRGB.mode = receivedData[5];
            deviceInfo.dongle4KRGB.color1 = UserConvert.Buffer_To_Color(receivedData, 6);
            deviceInfo.dongle4KRGB.color2 = UserConvert.Buffer_To_Color(receivedData, 9);
            deviceInfo.dongle4KRGB.color3 = UserConvert.Buffer_To_Color(receivedData, 12);
            break;

          case Command.Get4KDongleRGBValue:
            deviceInfo.dongle4KRGB.mode = receivedData[5];
            deviceInfo.dongle4KRGB.color1 = UserConvert.Buffer_To_Color(receivedData, 6);
            deviceInfo.dongle4KRGB.color2 = UserConvert.Buffer_To_Color(receivedData, 9);
            deviceInfo.dongle4KRGB.color3 = UserConvert.Buffer_To_Color(receivedData, 12);
            break;

          case Command.SetLongRangeMode:
            break;

          case Command.GetLongRangeMode:
            deviceInfo.mouseCfg.supportLongDistance = true;
            deviceInfo.mouseCfg.longDistance = receivedData[5] == 1;
            break;

          case Command.SetDongleRGBBarMode:
            deviceInfo.dongleRGBBar.mode = receivedData[5];
            deviceInfo.dongleRGBBar.color = UserConvert.Buffer_To_Color(receivedData, 6);
            deviceInfo.dongleRGBBar.speed = receivedData[9];
            deviceInfo.dongleRGBBar.brightness = receivedData[10];
            deviceInfo.dongleRGBBar.time = receivedData[11];              
            break;

          case Command.GetDongleRGBBarMode:
            deviceInfo.dongleRGBBar.mode = receivedData[5];
            deviceInfo.dongleRGBBar.color = UserConvert.Buffer_To_Color(receivedData, 6);
            deviceInfo.dongleRGBBar.speed = receivedData[9];
            deviceInfo.dongleRGBBar.brightness = receivedData[10];
            deviceInfo.dongleRGBBar.time = receivedData[11];                                             
            break;

          case Command.GetDongleVersion:
            var version = "v" + receivedData[5].toString()
            + "." + receivedData[6].toString(16).padStart(2, '0');
            deviceInfo.version.dongle = version;
            break;

          case Command.SetDongle3RGBMode:
            deviceInfo.dongle3LEDRGB.mode = [];
            for(var i = 0;i < 3;i++)
              deviceInfo.dongle3LEDRGB.mode.push(receivedData[5 + i]);
            break;

          case Command.GetDongle3RGBMode:
            deviceInfo.dongle3LEDRGB.mode = [];
            for(var i = 0;i < 3;i++)
              deviceInfo.dongle3LEDRGB.mode.push(receivedData[5 + i]);
            break;
        }
      }
      else if(receivedData[1] == 1)
      {
        switch(command)
        {      
          //不支持远距离模式
          case Command.GetLongRangeMode:
            deviceInfo.mouseCfg.supportLongDistance = false;
            break;

          case Command.GetCurrentConfig:
            deviceInfo.supportChangeProfile = false;
            break;

          case Command.GetDongleVersion:
            deviceInfo.version.dongle = "v1.0";
            break;
        }
      }
      sendingFlag = false;
    }
  }
}
 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//下发USB数据
//data：长度16的byte数组
async function Send_HID_Buffer(data) {
  var result = false;

  if(visit)
  {
    return visit;
  }

  for(var i = 0;i < 5;i++)
  {
    var cnt = 0;
    result = true;
    sendingFlag = true;
    try {
      await device.sendReport(ReportId, data);
    } catch (error) {
      console.error("Send_HID_Buffer",error);
    }
  
    do {
      await sleep(5);
      cnt++;
    }while(sendingFlag && (cnt < 40));

    if(sendingFlag)
      console.log("write:",sendingFlag,cnt,data,receivedData);

    var len = 3;
    if(data[0] == 0x08) {
      len = 5;
    }
    for(var j = 0;j < len;j++)
      {
        if(receivedData[1] === 1) {
          result = true;
          break;
        }
        if(data[j] !== receivedData[j])
        {
          result = false;
          break;
        }
      }

    if(result == true)
      break;
    else {
      await sleep(10);
    }

  }

  return result;
}

//Crc校验
function get_Crc(value) {
  var crc = 0;
  for(var i = 0;i < value.length - 1;i++)
  {
    crc += value[i];
  }
  crc = (crc & 0xFF);
  crc = 0x55 - crc;
  return crc;
}

//下发带数据的驱动命令
async function Send_Command_With_Value(com,value) {
  let data = Uint8Array.of(com, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);
  let crc = 0;
  data[4] = value.length;
  for(let i = 0;i < value.length;i++)
  {
    data[5 + i] = value[i];
  }
  crc = get_Crc(data);
  data[15] = crc - ReportId;

  var result = await Send_HID_Buffer(data);
  return result;
}

//下发不带数据的驱动命令
async function Send_Command(com) {
  let data = Uint8Array.of(com, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef); // 示例数据 

  let crc = get_Crc(data);
  data[15] = crc  - ReportId;

  await Send_HID_Buffer(data);
}

//获取设备信息
//return 设备cid，mid和类型
async function Get_Device_Info() {
  var value = [];
  // 获取指定范围内的随机整数（包括最小值和最大值）
  var min = 0;
  var max = 255;
  
  value[0] = Math.floor(Math.random() * (max - min + 1)) + min;
  value[1] = Math.floor(Math.random() * (max - min + 1)) + min;
  value[2] = Math.floor(Math.random() * (max - min + 1)) + min;
  value[3] = Math.floor(Math.random() * (max - min + 1)) + min;
  
  value[4] = 0;
  value[5] = 0;
  value[6] = 0;
  value[7] = 0;

  var info = {};
  if(await Send_Command_With_Value(Command.EncryptionData,value)) {
    info = {
      cid:deviceInfo.info.cid,//设备的CID，MID
      mid:deviceInfo.info.mid,
      type:deviceInfo.info.type//设备类型 0:dongle_1K, 1:dongle_4K, 2:有线_1K  3:有线_8K 4:dongle_2K 5:dongle_8K
    }
  }
  
  return info;
}

//下发驱动在线命令，暂时不用
async function Set_PC_Satae(value) {  
  var arr = [];
  arr[0] = value;
  await Send_Command_With_Value(Command.PCDriverStatus,arr);
}

//获取设备在不在线
//return true：设备在线
//       false：设备不在线
async function Get_Device_Online() {
  await Send_Command(Command.DeviceOnLine);

  if(receivedData[5] === 1)
    return true;
  else
    return false;
}

//获取设备在不在线，如果不在线需要弹窗提示
//return true：设备在线
//       false：设备不在线
async function Get_Device_Online_With_Dialog() {
  await Send_Command(Command.DeviceOnLine);

  if(visit) {
    return true;
  }
  else {
    if(receivedData[5] === 1)
      return true;
    else
    {
      deviceInfo.online = false;
      deviceInfo.showOfflineDialog = true;
      return false;
    }
  }
} 

//获取设备电池电量
async function Get_Device_Battery() {
  if(getBatteryFlag) {
    var flag = await Get_Device_Online();

    if(flag == true) {
      await Send_Command(Command.BatteryLevel);
    }
    else {
      getBatteryFlag = false;
      deviceInfo.batteryOptimize = false;

      clearInterval(onlineTimerID);
      onlineTimerID = setInterval(Get_Online_Interval,1500); 
    }
  }
}

function Set_Pair_CID(value) {
  deviceInfo.pairCID = value;

}

//设备进入对码模式
async function Set_Device_EnterPairMode() {   
  let data = Uint8Array.of(Command.DongleEnterPair, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);
    let crc = 0;
    data[4] = 2;
    data[5] = 0x00; 
    data[6] = 0x00;
    data[7] = deviceInfo.pairCID == 0 ? deviceInfo.info.cid : deviceInfo.pairCID;    
    crc = get_Crc(data);
    data[15] = crc - ReportId;
    console.log("Set_Pair_CID",deviceInfo.pairCID,data[7],deviceInfo)
    await Send_HID_Buffer(data);
}

//获取设备对码结果
async function Get_Device_PairResult() {
  getPairResultTimeCount++;
  var result = await Send_Command(Command.GetPairState);
  if((result == false) || (getPairResultTimeCount >= 20)) {
      getBatteryFlag = true;
      pairResult.pairStatus = DevicePairResult.Fail;
      if(pairTimerID) {
        clearInterval(pairTimerID);
      }     
  }
}

//设备恢复出厂设置
async function Device_Restore() {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(visit)
    return;

  if(flag == true) {
    deviceInfo.isRestoring = true;
    getBatteryFlag = false;
    var cnt = 0;
    let data = Uint8Array.of(Command.ClearSetting, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef); // 示例数据 

    let crc = get_Crc(data);
    data[15] = crc  - ReportId;

    await device.sendReport(ReportId, data);
  
    do {
      await sleep(300);
      cnt++;
    }while((deviceInfo.isRestoring) && (cnt < 4));

    if(deviceInfo.isRestoring == false) {
      if(deviceInfo.isWired == false) {
        await Get_Dongle_Param();
      }
      await Read_Mouse_Flash();
      await Get_Device_Profile();
      //无线模式下且支持远距离模式
      if(typeof deviceInfo.mouseCfg.defaultLongDistance != "undefined") {
        if(deviceInfo.isWired == false && deviceInfo.mouseCfg.supportLongDistance) {
          await Set_Device_LongDistance(deviceInfo.mouseCfg.defaultLongDistance ? 1 : 0);
          deviceInfo.mouseCfg.longDistance = deviceInfo.mouseCfg.defaultLongDistance;
        }
      }

      if(typeof deviceInfo.defaultDongle4KRGB != 'undefined') {
       if(deviceInfo.isWired == false) {
          deviceInfo.dongle4KRGB.mode = deviceInfo.defaultDongle4KRGB.mode;
          await Set_Device_4KDongleRGB();
        }        
      }

      if(typeof deviceInfo.defaultDongleRGBBar != 'undefined') {
       if(deviceInfo.isWired == false) {
          deviceInfo.dongleRGBBar = JSON.parse(JSON.stringify(deviceInfo.defaultDongleRGBBar));
          await Set_Device_DongleRGBBar();
        }        
      }

      deviceInfo.connectState = DeviceConectState.Connected;
    }
    getBatteryFlag = true;
  }
}

//设置设备配置
async function Set_Device_Profile(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    var data =[];
    data.push(value);
    setCurrentPorfileFlag = true;
    await Send_Command_With_Value(Command.SetCurrentConfig,data);

    if(visit == false) {
      await Read_Mouse_Flash();
      deviceInfo.connectState = DeviceConectState.Connected;
    }
    deviceInfo.profile = value;    
    setCurrentPorfileFlag = false;
  }

  return flag;
}

//获取设备当前配置
async function Get_Device_Profile() {
  await Send_Command(Command.GetCurrentConfig);
}

//获取设备版本（不是接收器的）
async function Get_Device_Version() {
  await Send_Command(Command.ReadVersionID);
}

async function Set_Device_4KDongleRGB() {
  var data = new Uint8Array(10);
  data[0] = deviceInfo.dongle4KRGB.mode;
  var color = UserConvert.Color_To_Buffer(deviceInfo.dongle4KRGB.color1);
  data[1] = color[0];
  data[2] = color[1];
  data[3] = color[2];
  color = UserConvert.Color_To_Buffer(deviceInfo.dongle4KRGB.color2);
  data[4] = color[0];
  data[5] = color[1];
  data[6] = color[2];
  color = UserConvert.Color_To_Buffer(deviceInfo.dongle4KRGB.color3);
  data[7] = color[0];
  data[8] = color[1];
  data[9] = color[2];

  await Send_Command_With_Value(Command.Set4KDongleRGB, data);
}

async function Set_Device_4KDongleRGBMode(mode) {
  deviceInfo.dongle4KRGB.mode = mode;
  await Set_Device_4KDongleRGB();
}

async function Set_Device_4KDongleRGBColor(index,color) {
  if(index == 0) {
    deviceInfo.dongle4KRGB.color1 = color;
  }
  else if(index == 1) {
    deviceInfo.dongle4KRGB.color2 = color;
  }
  else if(index == 2) {
    deviceInfo.dongle4KRGB.color3 = color;
  }  
  await Set_Device_4KDongleRGB();
}

//设置设备远距离模式，数据长度是10个
async function Set_Device_LongDistance(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    var data = new Uint8Array(10);
    data[0] = value;
    await Send_Command_With_Value(Command.SetLongRangeMode,data);
  }
  return flag;
}

async function Get_Dongle_Param() {
  await Get_Dongle_Version();
  await Get_Device_4KDongleRGB();
  await Get_Device_DongleRGBBar();
  await Get_Dongle_3RGBMode();
}

async function Get_Device_4KDongleRGB(value) {
  await Send_Command(Command.Get4KDongleRGBValue); 
}

//获取设备远距离模式
async function Get_Device_LongDistance() {
  await Send_Command(Command.GetLongRangeMode); 
}

async function Set_Device_DongleRGBBar() {
  var data = new Uint8Array(10);
  data[0] = deviceInfo.dongleRGBBar.mode;
  var color = UserConvert.Color_To_Buffer(deviceInfo.dongleRGBBar.color);
  data[1] = color[0];
  data[2] = color[1];
  data[3] = color[2];
  data[4] = deviceInfo.dongleRGBBar.speed;
  data[5] = deviceInfo.dongleRGBBar.brightness;
  data[6] = deviceInfo.dongleRGBBar.time;

  await Send_Command_With_Value(Command.SetDongleRGBBarMode, data);
}

async function Set_Device_LightMode(mode) {
  deviceInfo.dongleRGBBar.mode = mode;
  await Set_Device_DongleRGBBar();
}

async function Set_Device_LightColor(color) {
  deviceInfo.dongleRGBBar.color = color;
  await Set_Device_DongleRGBBar();
}

async function Set_Device_LightSpeed(speed) {
  deviceInfo.dongleRGBBar.speed = speed;
  await Set_Device_DongleRGBBar();
}

async function Set_Device_LightBrightness(brightness) {
  deviceInfo.dongleRGBBar.brightness = brightness;
  await Set_Device_DongleRGBBar();
}

async function Set_Device_LightTime(time) {
  deviceInfo.dongleRGBBar.time = time;
  await Set_Device_DongleRGBBar();
}

async function Get_Device_DongleRGBBar() {
  await Send_Command(Command.GetDongleRGBBarMode);   
}

async function Get_Dongle_Version() {
  await Send_Command(Command.GetDongleVersion);
}

// 0: 关闭
// 1: 连接状态(指示信号强度)  
// 2：电量指示
// 3：回报率指示

async function Set_Dongle_3RGBMode(index,mode) {
  var data = new Uint8Array(10);
  for(var i = 0;i < 3;i++) {
    if(i == index) {
      data[i] = mode;
    }
    else {
      data[i] = deviceInfo.dongle3LEDRGB.mode[i];
    }
  }
  await Send_Command_With_Value(Command.SetDongle3RGBMode, data);
}

async function Get_Dongle_3RGBMode() {
  await Send_Command(Command.GetDongle3RGBMode);
}

//设置eeprom内容（长度>=2）
async function Set_Device_Eeprom_Array(address,value) {
  let data = Uint8Array.of(0x07, 0x00, address >> 8, address & 0xFF, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);

  var result = false;
  var cnt = (value.length % 10);
  cnt = (cnt > 0) ? (Math.floor(value.length / 10) + 1): Math.floor(value.length / 10);

  for(var i = 0;i < cnt;i ++) {
    var add = (address + i * 10);
    var len = ((((i + 1) * 10) > value.length) ? (value.length - (i * 10)) : 10);

    data[0] = 0x07;
    data[1] = 0x00;
    data[2] = add >> 8;
    data[3] = add & 0xFF;
    data[4] = len;
    for(var j = 0; j < 10; j++) {
      if(j < len)
        data[5 + j] = value[j + i * 10];
      else
        data[5 + j] = 0;
    }

    data[15] = get_Crc(data) - ReportId;
    
    result = await Send_HID_Buffer(data);
    if(result == false) {
      break;
    }
  } 

  if(result) {
    for(var i = 0;i < value.length;i++) {
      flashData[i + address] = value[i];
    }
  }
}

//设置eeprom内容（长度==1）
async function Set_Device_Eeprom_Value(address,value) {
  let data = Uint8Array.of(0x07, 0x00, address >> 8, address & 0xFF, 0x02, 0x08, 0x4d,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef); // 示例数据 

  data[5] = value;
  data[6] = 0x55 - value;
  let crc = get_Crc(data);
  data[15] = crc - ReportId;

  if(await Send_HID_Buffer(data)) {
    flashData[address] = value;
    flashData[address + 1] = data[6];

    console.log("Set_Device_Eeprom_Value",address,value);
  }
}

//获取eeprom数据
async function Get_Device_Eeprom_Buffer(address,length) {
  let data = Uint8Array.of(0x08, 0x00, address >> 8, address & 0xFF, length, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);
  let crc = 0;
  crc = get_Crc(data);
  data[15] = crc - ReportId;

  await Send_HID_Buffer(data);
}

//读取鼠标的flash内容
async function Read_Mouse_Flash() {
  deviceInfo.connectState = DeviceConectState.Connecting;
  flashData.fill(0xFF);
  let data = Uint8Array.of(0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef); // 示例数据 
  var add = 0;
  do {
    var result = true;
    data[2] = add >> 8;
    data[3] = add & 0xFF;
    data[4] = 10;

    let crc = get_Crc(data);
    data[15] = crc  - ReportId;
  
    await Send_HID_Buffer(data);

    for(var i = 0;i < 5;i++) {
      if(data[i] !== receivedData[i])
      {
        result = false;
        break;
      }
    }

    if(result) {
      for(var j = 0;j < 10;j++)
      {
        flashData[add + j] = receivedData[j + 5];
      }
      add += 10;
    }
    else {
      console.error("read fail",add);
    }
  }while(add < 0x100);

  /*2025.09.02 修改*/
  let flashCRC = 0;
  let endFFFlash = 0;
  for(var i = 0;i < 0x100;i++) {
    if(flashData[i] != 0xff) {
      endFFFlash = i;
    }  
  }

  for(var i = 0;i < 0x100;i++) {
    if(flashData[i] == 0xff) {
      
      if(flashCRC == 0) {
        if(i >= endFFFlash) {
          flashEndAddress = endFFFlash;
          break;
        }
      }
    }

    flashCRC += flashData[i];
    if((flashCRC & 0xff) == 0x55) {
      flashCRC = 0;
    }
  }
  /*2025.09.02 修改*/
  console.log("readFullFlash",flashData,endFFFlash,flashCRC,flashEndAddress);
  await Update_Mouse_Info();
  await Get_Mouse_FunctionKeys();
  console.log("device info:",deviceInfo);
}


//写鼠标flash内容
async function Write_Mouse_Flash(buffer) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag) {
    getBatteryFlag = false;
    deviceInfo.connectState = DeviceConectState.Connecting;
    var value = [];
    value.length = flashEndAddress;  /*2025.09.02 修改*/
    for(var i = 0;i <= flashEndAddress;i++) {   /*2025.09.02 修改*/
      value[i] = buffer[i];
    }

    await Set_Device_Eeprom_Array(0,value);

    Update_Mouse_Info();
    deviceInfo.mouseCfg.shortCutKey = [];
    deviceInfo.mouseCfg.macros = [];

    for(var i = 0;i < deviceInfo.mouseCfg.keysCount;i++)
    {
      var addr = i * 4 + 0x60;
      var tmp = (buffer[addr + 1] << 8) + buffer[addr + 2];
      var keyValue = [buffer[addr].toString(16),"0x" + tmp.toString(16).padStart(4, '0'),];
      deviceInfo.mouseCfg.keys[i] = keyValue;


      var same = true;
      var address = 0;

      for(var k = 0;k < 2;k++) {
        same = true;
        if(k == 0) {
          value.length = 0x20;
          address = MouseEepromAddr.ShortcutKey;
        }
        else {
          value.length = 0x180;
          address = MouseEepromAddr.Macro;
        }
        address += i * value.length;

        var diff=[];
        for(var j = 0;j < value.length;j++) {
          value[j] = buffer[address + j];

          if(flashData[address + j] != value[j]) {
            same = false;
            diff.push(j);
          }
        }

        if(same == false) {
          await Set_Device_Eeprom_Array(address,value);
        }       
      }

      var shortCut = {
        isMedia : false,
        contexts : [],
      }
  
      if(keyValue[0] == MouseKeyFunction.ShortcutKey) {
        shortCut = Update_Mouse_ShortcutKey(i);
      }
      deviceInfo.mouseCfg.shortCutKey.push(shortCut);
      
      var macro = {
        name : "",
        contexts : [],
        cycleTimes: buffer[addr + 2],
      }
  
      if(keyValue[0] == MouseKeyFunction.Macro) {
        var tmp = Update_Mouse_Macro(i);
        macro.name = tmp.name;
        macro.contexts = tmp.contexts;
      }
      deviceInfo.mouseCfg.macros.push(macro);
      console.log("Write_Mouse_Flash i:",i,deviceInfo,buffer,flashData);
    }
    deviceInfo.connectState = DeviceConectState.Connected;
    console.log("Write_Mouse_Flash:",deviceInfo,buffer,flashData);
    getBatteryFlag = true;
  }

  return flag;
}

//鼠标不在线时定时获取在不在线定时器
async function Get_Online_Interval() {
  var flag = await Get_Device_Online();
  if(flag)
  {
    clearInterval(onlineTimerID);
    getFlashTimerTickCount = 0;
    getFlashTimerID = setInterval(Get_Flash_Time_Tick,1000); 
    console.log("driverOnline",driverOnlineFlag);
    if(typeof driverOnlineFlag != "undefined") {
      if(driverOnlineFlag)
        await Set_PC_Satae(1); //网页驱动版本现在不需要了
    }
    
    try {
      await Read_Mouse_Flash();
      getBatteryFlag = true;
      await Get_Device_Battery();
      await Get_Device_Profile();
      await Get_Device_Version();
      //只有无线才需要获取远距离模式
      if(typeof deviceInfo.mouseCfg.defaultLongDistance != "undefined") {
        if(deviceInfo.isWired) {
          deviceInfo.mouseCfg.supportLongDistance = false;
        }
        else {
          await Get_Device_LongDistance();
        }
      }
      else {
        deviceInfo.mouseCfg.supportLongDistance = false;
      }
      deviceInfo.connectState = DeviceConectState.Connected;

      if(getFlashTimerID) {
        clearInterval(getFlashTimerID);
      }    
    } catch (error) {
      console.error("Get_Online_Interval",error);
      Device_Close();
      return flag;
    }
  }
  return flag;
}

function Get_Flash_Time_Tick() {
  getFlashTimerTickCount++;

  if(getFlashTimerTickCount >= 10) {
    console.error("Get_Flash_Time_Tick");
    if(deviceInfo.connectState == DeviceConectState.Connecting) {
      deviceInfo.connectState == DeviceConectState.TimeOut;
      Device_Close();
    }
  }
}

function EepromValue_To_DPIValue(val,dpiEx) {
  var high = (dpiEx & 0x0C) >> 2;
  var value = (val) + (high << 8);
  var doubleFlag = (dpiEx & 0x01) == 0x01;
  var step100Flag = (dpiEx & 0x02) == 0x02;

  var index = 0;
  if ((typeof deviceInfo.mouseCfg.sensor.cfg.values !== "undefined") &&
      (deviceInfo.mouseCfg.sensor.cfg.values !== null)) {

    for(index = 0;index < deviceInfo.mouseCfg.sensor.cfg.values.length;index++) {
      if(deviceInfo.mouseCfg.sensor.cfg.values[index] == value) {
        break;
      }
    }

    value = index * deviceInfo.mouseCfg.sensor.cfg.range[0].step +
            deviceInfo.mouseCfg.sensor.cfg.range[0].min;
    console.log("updateMouseDpi",index,value);
  }
  else {
    if(deviceInfo.mouseCfg.sensor.type == "OM76")
      value = value * deviceInfo.mouseCfg.sensor.cfg.range[0].step + ((step100Flag == 0) ? deviceInfo.mouseCfg.sensor.cfg.range[0].min : 0);
    else
      value = (value + 1) * deviceInfo.mouseCfg.sensor.cfg.range[0].step;
  }

  if(doubleFlag) {
    value *= 2;
  }

  if(step100Flag) {
    if(deviceInfo.mouseCfg.sensor.type == "OM76")
      value *= 10;
    else
      value *= 2;
  }

  return value;
}

//更新鼠标DPI
function Update_Mouse_Dpi() {
  for(var i = 0;i < 8;i ++) {
    var addr = i * 4 + MouseEepromAddr.DPIValue;
    // var high = (flashData[addr + 2] & 0x0C) >> 2;
    // var value = (flashData[addr]) + (high << 8);
    // var doubleFlag = (flashData[addr + 2] & 0x01) == 0x01;
    // var step100Flag = (flashData[addr + 2] & 0x02) == 0x02;

    // if ((typeof deviceInfo.mouseCfg.sensor.cfg.values !== "undefined") &&
    //     (deviceInfo.mouseCfg.sensor.cfg.values !== null)) {

    //   for(var index = 0;index < deviceInfo.mouseCfg.sensor.cfg.values.length;index++) {
    //     if(deviceInfo.mouseCfg.sensor.cfg.values[index] == value) {
    //       break;
    //     }
    //   }

    //   value = index * deviceInfo.mouseCfg.sensor.cfg.range[0].step +
    //           deviceInfo.mouseCfg.sensor.cfg.range[0].min;
    //   console.log("updateMouseDpi",i,index,value);
    // }
    // else {
    //   value = (value + 1) * deviceInfo.mouseCfg.sensor.cfg.range[0].step;
    // }

    // if(doubleFlag)
    // {
    //   value *= 2;
    // }

    // if(step100Flag)
    // {
    //   value *= 2;
    // }
    
    deviceInfo.mouseCfg.dpis[i].value = EepromValue_To_DPIValue(flashData[addr],flashData[addr + 2]);
    deviceInfo.mouseCfg.dpis[i].color = UserConvert.Buffer_To_Color(flashData,addr + 0x20);
  }
}

//更新鼠标信息
async function Update_Mouse_Info() {
  deviceInfo.mouseCfg.reportRate = UserConvert.FlashData_To_ReportRate(flashData[0]);

  if(deviceInfo.mouseCfg.reportRate > deviceInfo.maxReportRate) {
    deviceInfo.mouseCfg.reportRate = deviceInfo.maxReportRate;
    console.log("current reportRate > maxReportRate",deviceInfo.mouseCfg.reportRate);
  }

  deviceInfo.mouseCfg.sensor.lod = flashData[MouseEepromAddr.LOD];

  Update_Mouse_Dpi();

  deviceInfo.mouseCfg.maxDpiStage = flashData[MouseEepromAddr.maxDpiStage];
  deviceInfo.mouseCfg.currentDpi = flashData[MouseEepromAddr.CurrentDPI];

  deviceInfo.mouseCfg.dpiEffect.mode = flashData[MouseEepromAddr.DPIEffectMode];
  deviceInfo.mouseCfg.dpiEffect.brightness = DPILightBrightness_To_Index(flashData[MouseEepromAddr.DPIEffectBrightness]);
  deviceInfo.mouseCfg.dpiEffect.speed = flashData[MouseEepromAddr.DPIEffectSpeed];
  deviceInfo.mouseCfg.dpiEffect.state = flashData[MouseEepromAddr.DPIEffectState] == 1?on : off;

  deviceInfo.mouseCfg.lightEffect.mode = flashData[MouseEepromAddr.Light];
  deviceInfo.mouseCfg.lightEffect.color = UserConvert.Buffer_To_Color(flashData,0xA1);
  deviceInfo.mouseCfg.lightEffect.speed = flashData[0xA4] > 9 ? 9 : flashData[0xA4];
  deviceInfo.mouseCfg.lightEffect.brightness = flashData[0xA5] > 9 ? 9 : flashData[0xA5];
  deviceInfo.mouseCfg.lightEffect.state = flashData[0xA7] == 1?on : off;
  deviceInfo.mouseCfg.lightEffect.movingOffState = flashData[MouseEepromAddr.MovingOffLight] == 1;
  deviceInfo.mouseCfg.sleepTime = flashData[MouseEepromAddr.SleepTime];

  deviceInfo.mouseCfg.debounceTime = flashData[MouseEepromAddr.DebounceTime];
  deviceInfo.mouseCfg.sensor.motionSync = flashData[MouseEepromAddr.MotionSync] == 1;
  deviceInfo.mouseCfg.sensor.performance = flashData[MouseEepromAddr.Performance];
  deviceInfo.mouseCfg.sensor.angle = flashData[MouseEepromAddr.Angle] == 1;
  deviceInfo.mouseCfg.sensor.ripple = flashData[MouseEepromAddr.Ripple] == 1;
  deviceInfo.mouseCfg.sensor.performanceState = flashData[MouseEepromAddr.PerformanceState] == 1;
  deviceInfo.mouseCfg.sensor.sensorMode = flashData[MouseEepromAddr.SensorMode];
  deviceInfo.mouseCfg.sensor.fps20k = flashData[MouseEepromAddr.SensorFPS20K];

  if ((((flashData[MouseEepromAddr.AngleTune] + flashData[MouseEepromAddr.AngleTune +1]) & 0xFF) == 0x55) &&
      (((flashData[MouseEepromAddr.AngleTuneState] + flashData[MouseEepromAddr.AngleTuneState +1]) & 0xFF) == 0x55)) {  
    deviceInfo.mouseCfg.supportAngleTune = true;
    var temp = flashData[MouseEepromAddr.AngleTune];
    if(flashData[MouseEepromAddr.AngleTune] >= 0x80) {
      temp -= 0x100;
    }
    deviceInfo.mouseCfg.angleTune = temp;//-30 ~ 30
    deviceInfo.mouseCfg.angleTuneState = flashData[MouseEepromAddr.AngleTuneState];
  }
  else {
    deviceInfo.mouseCfg.supportAngleTune = false;
  }  
  //鼠标配置初始化成功
}

//获取鼠标按键功能
async function Get_Mouse_FunctionKeys() {
  if(deviceInfo.connectState == DeviceConectState.Connecting) {
    deviceInfo.mouseCfg.shortCutKey = [];
    deviceInfo.mouseCfg.macros = [];
    for(var i = 0;i < deviceInfo.mouseCfg.keysCount;i++)
    {
      var addr = i * 4 + 0x60;
      var tmp = (flashData[addr + 1] << 8) + flashData[addr + 2];
      var value = [flashData[addr].toString(16).toUpperCase(),"0x" + tmp.toString(16).padStart(4, '0'),];

      if(flashData[addr] == MouseKeyFunction.DPILock) {
        var dpi = EepromValue_To_DPIValue(flashData[addr + 1],flashData[addr + 2]);
        value = [flashData[addr].toString(16).toUpperCase(),dpi.toString()];
      }

      deviceInfo.mouseCfg.keys[i] = value;

      var shortCut = {
        isMedia : false,
        contexts : [],
      }
  
      if(value[0] == MouseKeyFunction.ShortcutKey) {
        await Get_MS_ShortcutKey(i);
        shortCut = Update_Mouse_ShortcutKey(i);
      }
      deviceInfo.mouseCfg.shortCutKey.push(shortCut);
      
      var macro = {
        name : "",
        contexts : [],
        cycleTimes: flashData[addr + 2],
      }
  
      if(value[0] == MouseKeyFunction.Macro) {
        await Get_MS_Macro(i);
        var tmp = Update_Mouse_Macro(i);
        macro.name = tmp.name;
        macro.contexts = tmp.contexts;
      }
      deviceInfo.mouseCfg.macros.push(macro);
    }

    clearInterval(batteryTimerID);
    batteryTimerID = setInterval(Get_Device_Battery,5000);     
  }
}

//更新鼠标快捷键
function Update_Mouse_ShortcutKey(index) {
  var shortCut = {
    isMedia : false,
    contexts : [],
  }

  var addr = MouseEepromAddr.ShortcutKey + 0x20 * index;
  var count = flashData[addr];
  var contexts = [];
  for(var i = 0;i < (count / 2);i ++) {
    var type = flashData[addr + i * 0x03 + 1] & 0x0F;
    var value = (flashData[addr + i * 0x03 + 3] << 8) + 
    flashData[addr + i * 0x03 + 2];
    var context = {
      type : type,
      value : value,
    };
    contexts.push(context);
  }

  //快捷键类型是多媒体键
  if(contexts.length == 1) {
    if(contexts[0].type == 2) {
      shortCut.isMedia = true;

      var context = {
        type : contexts[0].type,
        value : "0x" + contexts[0].value.toString(16).padStart(4, '0').toUpperCase(),
      };
      shortCut.contexts.push(context);
    }
  }

  if(shortCut.isMedia == false) {
    shortCut.contexts = contexts;
  }

  return shortCut;
}

//更新鼠标宏
function Update_Mouse_Macro(index) {
  var addr = MouseEepromAddr.Macro + 0x180 * index;

  var nameLen = flashData[addr];
  var contextLen = flashData[addr + 0x1F];
  var context;
  if ((nameLen <= 30) && (nameLen > 0)
    && (contextLen <= 70))
  {
    var names = new Uint8Array(nameLen);
    for(var i = 0;i < nameLen;i++) {
      names[i] = flashData[addr + 1 + i];
    }
  
    var name = UserConvert.UTF8_To_String(names);
    console.log("Update_Mouse_Macro",names,name);

    var contexts = [];
    for(var i = 0;i < contextLen;i++) {
      var tmp = flashData[addr + 0x20 + i * 5];

      var status = tmp >> 6;
      status = status === 2 ? 0 : 1;
      var type = tmp & 0x0F;
      var value = (flashData[addr + 0x20 + i * 5 + 2] << 8) +
                   flashData[addr + 0x20 + i * 5 + 1];

      var delay = (flashData[addr + 0x20 + i * 5 + 3] << 8) +
                   flashData[addr + 0x20 + i * 5 + 4];
      var context ={
        status:status,
        type:type,
        value:value,
        delay:delay,
      };

      contexts.push(context);
    }    

    var macro = {
      name : name,
      contexts : contexts,
    }

    return macro;
  }
  return null;
}

//value值为报告率值，例如500Hz value=500
async function Set_MS_ReportRate(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true){ 
    var reportRate = 1;
    if(value <= 1000)
    {
      reportRate = 1000 / value;
    }
    else
    {
      reportRate = (value / 2000) * 0x10;
    }

    await Set_Device_Eeprom_Value(MouseEepromAddr.ReportRate, reportRate);
    deviceInfo.mouseCfg.reportRate = value;
  }
  return flag;
}

//获取鼠标报告率
async function Get_MS_ReportRate() {
  await Get_Device_Eeprom_Buffer(MouseEepromAddr.ReportRate, 2);
}

//设置最大DPI值
async function Set_MS_MaxDPI(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) 
    await Set_Device_Eeprom_Value(MouseEepromAddr.maxDpiStage, value); 

  return flag;
}

//设置鼠标当前DPI档位，0-maxDPI-1
async function Set_MS_CurrentDPI(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    await Set_Device_Eeprom_Value(MouseEepromAddr.CurrentDPI, value); 
    deviceInfo.mouseCfg.currentDpi = value;
  }

  return flag;
}

//获取鼠标当前DPI档位
async function Get_MS_CurrentDPI() {
  await Get_Device_Eeprom_Buffer(MouseEepromAddr.CurrentDPI, 2);
}

async function Set_MS_XSpindown(value) {
  await Set_Device_Eeprom_Value(0x06,value); 
}

async function Set_MS_YSpindown(value) {
  await Set_Device_Eeprom_Value(0x08,value); 
}

function DPIValue_To_EepromValue(value) {
  var val = 0;

  var dpiEx = 0x00;
  var div = 1;
  var index;
  for(index = deviceInfo.mouseCfg.sensor.cfg.range.length - 1;index >= 0;index--) {
    if(value >= deviceInfo.mouseCfg.sensor.cfg.range[index].min) {
      break;
    }
  }

  if(index == 3) {
    div = 4;
    dpiEx = 0x33;
  }
  else if(index == 1 || index == 2) {
    div = 2;

    dpiEx = deviceInfo.mouseCfg.sensor.cfg.range[index].DPIex;
  }

  if(deviceInfo.mouseCfg.sensor.type == "OM76" 
    && dpiEx == 0x22)
    div = 10;
  else if(deviceInfo.mouseCfg.sensor.type == "OM76" 
    && dpiEx == 0x33)
    div = 20;

  val = value / div;

  if ((typeof deviceInfo.mouseCfg.sensor.cfg.values !== "undefined") &&
      (deviceInfo.mouseCfg.sensor.cfg.values !== null)) {
      index = (val - deviceInfo.mouseCfg.sensor.cfg.range[0].min) / deviceInfo.mouseCfg.sensor.cfg.range[0].step;
      val = deviceInfo.mouseCfg.sensor.cfg.values[index];
  }
  else {
    val = val / deviceInfo.mouseCfg.sensor.cfg.range[0].step;

    if(deviceInfo.mouseCfg.sensor.type == "OM76" && value > 10000)
      val -= 0;
    else
      val -= 1;
  }

  var temp = {
    val,
    dpiEx
  }
  return temp;
}

//设置DPI值，index为哪一个档，value为dpi值
async function Set_MS_DPIValue(index,value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    var addr = MouseEepromAddr.DPIValue + index * 4;
    var data = Uint8Array.of(0x00, 0x00, 0x00, 0x00);
    // var val = 0;

    // var dpiEx = 0x00;
    // var div = 1;
    // var index;
    // for(index = deviceInfo.mouseCfg.sensor.cfg.range.length - 1;index >= 0;index--) {
    //   if(value >= deviceInfo.mouseCfg.sensor.cfg.range[index].min) {
    //     break;
    //   }
    // }

    // if(index == 3) {
    //   div = 4;
    //   dpiEx = 0x33;
    // }
    // else if(index == 1 || index == 2) {
    //   div = 2;

    //   dpiEx = deviceInfo.mouseCfg.sensor.cfg.range[index].DPIex;
    // }

    // val = value / div;

    // if ((typeof deviceInfo.mouseCfg.sensor.cfg.values !== "undefined") &&
    //     (deviceInfo.mouseCfg.sensor.cfg.values !== null)) {
    //     index = (val - deviceInfo.mouseCfg.sensor.cfg.range[0].min) / deviceInfo.mouseCfg.sensor.cfg.range[0].step;
    //     val = deviceInfo.mouseCfg.sensor.cfg.values[index];
    // }
    // else {
    //   val = val / deviceInfo.mouseCfg.sensor.cfg.range[0].step - 1;
    // }
    var temp = DPIValue_To_EepromValue(value);
    data[0] = temp.val;
    data[1] = temp.val;
    var high = (temp.val) >> 8;
    data[2] = (high << 2) | (high << 6);
    data[2] |= temp.dpiEx;

    data[3] = get_Crc(data);
    console.log("Set_MS_DPIValue:",value,temp);
    await Set_Device_Eeprom_Array(addr,data); 
  }

  return flag;
}

//设置DPI值，index为哪一个档，value为dpi颜色值（格式rgb（255,0,0））
async function Set_MS_DPIColor(index,color) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    var addr = MouseEepromAddr.DPIColor + index * 4;
    var data = UserConvert.Color_To_Buffer(color);
    var value = Uint8Array.of(data[0], data[1], data[2], 0x00);
    value[3] = get_Crc(value);
    await Set_Device_Eeprom_Array(addr, value); 
  }

  return flag;
}

//获取DPI灯效
async function Get_MS_DPILightEffect() {
    await Get_Device_Eeprom_Buffer(MouseEepromAddr.DPIEffectMode, 8);  
}

//设置DPI灯效模式
async function Set_MS_DPILightMode(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    await Set_Device_Eeprom_Value(MouseEepromAddr.DPIEffectMode, value);  
    if(deviceInfo.mouseCfg.dpiEffect.state == off) {
      deviceInfo.mouseCfg.dpiEffect.state = on;
      await Set_Device_Eeprom_Value(MouseEepromAddr.DPIEffectState,1);
    }
  }

  return flag;
}

//设置DPI灯效亮度（仅呼吸模式）
async function Set_MS_DPILightBrightness(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    var bri = Index_To_DPILightBrightness(value);
    await Set_Device_Eeprom_Value(MouseEepromAddr.DPIEffectBrightness,bri); 
  }

  return flag;
}

/// <summary>
/// DPI亮度值切换
/// </summary>
/// <param name="index"></param>
/// <returns></returns>
function Index_To_DPILightBrightness(index)
{
    /*
      * 1=0x10
      * 2=0x1E
      * 3=0x3C
      * 4=0x5A
      * 5=0x80(默认)
      * 6=0x96
      * 7=0xB4
      * 8=0xD2
      * 9=0xE6
      * 10=0xFF
      */
    var value = 0;
    switch (index)
    {
        case 1:
            value = 0x10;
            break;
        case 2:
        case 3:
        case 4:
        case 6:
        case 7:
        case 8:
            value = 0x1E * (index - 1);
            break;
        case 5:
            value = 0x80;
            break;
        case 9:
            value = 0xE6;
            break;
        case 10:
            value = 0xFF;
            break;
        default:
            value = 0x80;
            break;
    }

    return value;
}

function DPILightBrightness_To_Index(value) {
  /*
  * 1=0x10
  * 2=0x1E
  * 3=0x3C
  * 4=0x5A
  * 5=0x80(默认)
  * 6=0x96
  * 7=0xB4
  * 8=0xD2
  * 9=0xE6
  * 10=0xFF
  */
  var index = 0;

  if (value % 0x1E == 0)
  {
      index = value / 0x1E + 1;
  }
  else
  {
      switch (value)
      {
          case 0x10:
              index = 1;
              break;
          case 0x80:
              index = 5;
              break;
          case 0xE6:
              index = 9;
              break;
          case 0xFF:
              index = 10;
              break;
          default:
              index = 5;
              break;
      }
  }
  
  return index;
}

//设置DPI灯效速度（仅常亮模式）
async function Set_MS_DPILightSpeed(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.DPIEffectSpeed,value);  

  return flag;
}

//关闭DPI灯效
async function Set_MS_DPILightOff() {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    deviceInfo.mouseCfg.dpiEffect.state = off;
    await Set_Device_Eeprom_Value(MouseEepromAddr.DPIEffectState,0); 
  }
  
  return flag;
}

async function setRGBColor(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Array(0x54,value);  
}

async function setRGBEffect(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(0x58,value);  
}

async function setRGBSpeed(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(0x5A,value);  
}

async function setRGBBri(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(0x5C,value);  
}

async function Set_MS_LightPowerSave(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(0x5E,value);  

  return flag;
}

//获取鼠标装饰灯
async function Get_MS_Light() {
  await Get_Device_Eeprom_Buffer(MouseEepromAddr.Light,7);
}

//设置鼠标装饰灯
async function Set_MS_Light() {
  var value = Uint8Array.of( 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  value[0] = deviceInfo.mouseCfg.lightEffect.mode;
  var color = UserConvert.Color_To_Buffer(deviceInfo.mouseCfg.lightEffect.color);
  value[1] = color[0];
  value[2] = color[1];
  value[3] = color[2];
  value[4] = deviceInfo.mouseCfg.lightEffect.speed;
  value[5] = deviceInfo.mouseCfg.lightEffect.brightness;
  value[6] = get_Crc(value);
  await Set_Device_Eeprom_Array(MouseEepromAddr.Light,value);   
}

//设置鼠标装饰灯颜色
async function Set_MS_LightColor(color) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
  {
    deviceInfo.mouseCfg.lightEffect.color = UserConvert.Buffer_To_Color(color,0);;
    await Set_MS_Light();   
  }

  return flag;
}

//设置鼠标装饰灯模式
async function Set_MS_LightMode(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
  {
    if(value == 0) {
      if(deviceInfo.mouseCfg.lightEffect.state == on) {
        await Set_Device_Eeprom_Value(0xA7,0);
        deviceInfo.mouseCfg.lightEffect.state  = off;
      }
    }
    else {
      if(deviceInfo.mouseCfg.lightEffect.state == off) {
        await Set_Device_Eeprom_Value(0xA7,1);
        deviceInfo.mouseCfg.lightEffect.state = on;
      }

      deviceInfo.mouseCfg.lightEffect.mode = value;
      await Set_MS_Light();  
    }
  }

  return flag;
}

//设置鼠标装饰灯亮度
async function Set_MS_LightBrightness(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
  {
    deviceInfo.mouseCfg.lightEffect.brightness = value;
    await Set_MS_Light();    
  }

  return flag;
}

//设置鼠标装饰灯速度
async function Set_MS_LightSpeed(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
  {
    deviceInfo.mouseCfg.lightEffect.speed = value;
    await Set_MS_Light();     
  }
  
  return flag;
}

//设置鼠标LOD值
async function Set_MS_LOD(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.LOD,value); 

  return flag;
}

//设置鼠标按键消抖时间
async function Set_MS_DebounceTime(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.DebounceTime,value);  

  return flag;
}

//设置鼠标motionsync
async function Set_MS_MotionSync(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.MotionSync,value);  

  return flag;
}

async function Set_MS_LightOffTime(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.SleepTime,value);  

  return flag;
}

//设置鼠标直线修正
async function Set_MS_Angle(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.Angle,value);  

  return flag;
}

//设置鼠标波纹控制
async function Set_MS_Ripple(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.Ripple,value); 
  
  return flag;
}

//设置鼠标移动关装饰灯状态
async function Set_MS_MovingOffState(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.MovingOffLight,value);  

  return flag;
}

//设置鼠标火力全开状态
async function Set_MS_PerformanceState(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.PerformanceState,value); 
  
  return flag;
}

//设置鼠标火力全开时间
async function Set_MS_PerformanceTime(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.Performance,value);  

  return flag;
}

//设置鼠标Sensor模式
async function Set_MS_SensorMode(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.SensorMode,value);  

  return flag;
}

async function Set_MS_AngleTune(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    if(deviceInfo.mouseCfg.angleTuneState == false) {
      await Set_Device_Eeprom_Value(MouseEepromAddr.AngleTuneState,1);  
      deviceInfo.mouseCfg.angleTuneState = 1;
    }

    var temp = value;
    if(value < 0) {
      temp += 0x100;
    }
    deviceInfo.mouseCfg.angleTune = value;//-30 ~ 30

    await Set_Device_Eeprom_Value(MouseEepromAddr.AngleTune,temp);  
  }

  return flag;   
}

//设置鼠标Sensor FPS 20K
async function Set_MS_SensorFPS20K(value) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
    await Set_Device_Eeprom_Value(MouseEepromAddr.SensorFPS20K,value);  

  return flag;
}

//设置鼠标按键功能：index为按键索引
async function Set_MS_KeyFunction(index,keyFunction) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
  {
    var addr = MouseEepromAddr.KeyFunction + index * 4;
    let data = Uint8Array.of(0x08, 0x00, 0x00, 0x00); // 示例数据 
    data[0] = keyFunction.type;
    if(keyFunction.type == MouseKeyFunction.DPILock) {
      var temp = DPIValue_To_EepromValue(keyFunction.param);
      data[1] = temp.val;
      data[2] = 0x00;
      data[3] = get_Crc(data);
    }
    else {
      data[1] = keyFunction.param >> 8;
      data[2] = keyFunction.param & 0xFF;
      data[3] = get_Crc(data);
    }

    await Set_Device_Eeprom_Array(addr,data);
    var keyValue = [keyFunction.type.toString(16),"0x" + keyFunction.param.toString(16).padStart(4, '0')];
    deviceInfo.mouseCfg.keys[index] = keyValue;
  } 

  return flag;
}

//设置鼠标多媒体按键：index为按键索引，value为键值
async function Set_MS_Multimedia(index,multimedia)
{
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true)
  {
    var addr = MouseEepromAddr.ShortcutKey + index * 0x20;
    var value = [];
    var data = UserConvert.String_To_Hex(multimedia);

    var cnt = 0;
    value[cnt++] = 0x02;
    value[cnt++] = 0x82;
    value[cnt++] = data & 0xFF;
    value[cnt++] = data >> 8;
   
    value[cnt++] = 0x42;
    value[cnt++] = data & 0xFF;
    value[cnt++] = data >> 8;
  
    value[cnt] = 0;
    value[cnt] = get_Crc(value);

    await Set_Device_Eeprom_Array(addr,value); 
    
    var shortCut = {
      isMedia : true,
      contexts : [],
    }

    shortCut = Update_Mouse_ShortcutKey(index);   
    deviceInfo.mouseCfg.shortCutKey[index] = shortCut;
  }

  return flag;
}

//设置鼠标快捷键：index为按键索引，shortCut为快捷键数组（例如[LCtrl,A]）
async function Set_MS_ShortcutKey(index,shortCut) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    var addr = MouseEepromAddr.ShortcutKey + index * 0x20;
    var value = [];

    var cnt = shortCut.length;
    console.log("shortCutKey:",shortCut,cnt);
    value.push(cnt * 2);
    for(var i = 0;i < cnt;i++) {
      var tmp = HIDKey.textToHID(shortCut[i]);

      value.push(tmp.type | 0x80);
      value.push(tmp.value & 0xFF);
      value.push((tmp.value >> 8) & 0xFF);
    }

    for(var i = 0;i < cnt;i++) {
      var tmp = HIDKey.textToHID(shortCut[cnt - 1 - i]);

      value.push(tmp.type | 0x40);
      value.push(tmp.value & 0xFF);
      value.push((tmp.value >> 8) & 0xFF);
    }

    value.push(0);
    value[value.length - 1] = get_Crc(value);
    await Set_Device_Eeprom_Array(addr,value);

    var shortCut = {
      isMedia : true,
      contexts : [],
    }

    shortCut = Update_Mouse_ShortcutKey(index);   
    deviceInfo.mouseCfg.shortCutKey[index] = shortCut;
  }

  return flag;
}

//获取鼠标快捷键：index为按键索引
async function Get_MS_ShortcutKey(index) {
  await Get_Device_Eeprom_Buffer(MouseEepromAddr.ShortcutKey + index * 0x20, 10);
  var count = flashData[MouseEepromAddr.ShortcutKey + index * 0x20];
  if(count > 2) {
    var start = 10;
    var end = count * 3 + 2;

    do{
      var len = (end - start) > 10 ? 10 : (end - start);
      await Get_Device_Eeprom_Buffer(MouseEepromAddr.ShortcutKey + index * 0x20 + start, len);
      start+=10;
    }while(start < end);
  }
}

//设置鼠标宏名称：index为按键索引，name为字符串，字符串转换的utf-8数组必须小于30
async function Set_MS_MacroName(index,name) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    var nameArray = UserConvert.String_To_UTF8(name);

    var value = new Uint8Array(30 + 1);
    value.fill(0xff);
    value[0] = nameArray.length;
    for(let i = 0; i < nameArray.length; i++) {
      value[i + 1] = nameArray[i];
    }

    var addr = MouseEepromAddr.Macro + index * 0x180;
    await Set_Device_Eeprom_Array(addr,value);
    deviceInfo.mouseCfg.macros[index].name = name;
  }

  return flag;
}

//设置鼠标宏：index为按键索引，contexts为数组
async function Set_MS_MacroContext(index, contexts) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    var value = [];

    value[0] = contexts.length;
    for(let i = 0; i < contexts.length; i++) {
      var status = 0;
      switch(contexts[i].status)
      {
        case 0:
          status = 2;
          break;

        case 1:
          status = 1;
          break;
      }
      var para = (status << 6) + contexts[i].type;
      value.push(para);

      para = (contexts[i].value & 0xFF);
      value.push(para);

      para = contexts[i].value >> 8;
      value.push(para);

      para = contexts[i].delay >> 8;
      value.push(para);    

      para = (contexts[i].delay & 0xFF);
      value.push(para);  
    }

    value.push(0);
    value[value.length - 1] = get_Crc(value);
    var addr = MouseEepromAddr.Macro + index * 0x180 + 0x1F;
    await Set_Device_Eeprom_Array(addr,value);

    deviceInfo.mouseCfg.macros[index].contexts = contexts;
  }

  return flag;
}

//设置鼠标宏：index为索引，macro = {name：name，contexts：contexts}
async function Set_MS_Macro(index,macro) {
  var flag = await Get_Device_Online_With_Dialog();

  if(flag == true) {
    var name = macro.name;
    var contexts = macro.contexts;
    var nameArray = UserConvert.String_To_UTF8(name);

    var value = new Uint8Array(33 + contexts.length * 5);
    value.fill(0xff);
    value[0] = nameArray.length;
    for(let i = 0; i < nameArray.length; i++) {
      value[i + 1] = nameArray[i];
    }

    value[31] = contexts.length;
    var tmp = [];
    for(let i = 0; i < contexts.length; i++) {
      var status = 0;
      switch(contexts[i].status)
      {
        case 0:
          status = 2;
          break;

        case 1:
          status = 1;
          break;
      }
      var para = (status << 6) + contexts[i].type;
      tmp.push(para);

      para = (contexts[i].value & 0xFF);
      tmp.push(para);

      para = contexts[i].value >> 8;
      tmp.push(para);

      para = contexts[i].delay >> 8;
      tmp.push(para);    

      para = (contexts[i].delay & 0xFF);
      tmp.push(para);  
    }

    tmp.push(0);
    tmp[tmp.length - 1] = get_Crc(tmp) - contexts.length;

    for(var i = 0;i < tmp.length;i++) {
      value[32 + i] = tmp[i];
    }
    
    var addr = MouseEepromAddr.Macro + index * 0x180;
    await Set_Device_Eeprom_Array(addr,value);

    deviceInfo.mouseCfg.macros[index].name = name;
    deviceInfo.mouseCfg.macros[index].contexts = contexts;

  }

  return flag;

  // var flag = await Set_MS_MacroName(index, macro.name);
  // if(flag) {
  //   flag = await Set_MS_MacroContext(index, macro.contexts);
  // }
  
  // return flag;
}

//恢复鼠标宏数据：index为索引
async function Restore_MS_Macro(index) {
  var flag = Get_Device_Online();

  if(flag) {
    var value = new Uint8Array(0x180);

    var macro = {
      name:'',
      contexts:[],
      cycleTimes:1,
    }
    deviceInfo.mouseCfg.macros[index] = macro;

    var addr = MouseEepromAddr.Macro + index * 0x180;
    await Set_Device_Eeprom_Array(addr,value);
  }
}

//获取鼠标宏名称
async function Get_MS_MacroName(index) {
  var addr = MouseEepromAddr.Macro + index * 0x180;
  await Get_Device_Eeprom_Buffer(addr, 10);

  var count = flashData[addr] + 1;
  if(count > 10) {
    var start = 10;
    var end = count;

    do{
      var len = (end - start) > 10 ? 10 : (end - start);
      await Get_Device_Eeprom_Buffer(addr + start, len);
      start+=10;
    }while(start < end);
  }  
}

//获取鼠标宏数据
async function Get_MS_MacroContext(index) {
  var addr = MouseEepromAddr.Macro + index * 0x180 + 0x1F;
  await Get_Device_Eeprom_Buffer(addr, 10);

  var count = flashData[addr];
  if(count >= 2) {
    var start = 10;
    var end = count * 5 + 2;

    do{
      var len = (end - start) > 10 ? 10 : (end - start);
      await Get_Device_Eeprom_Buffer(addr + start, len);
      start+=10;
    }while(start < end);
  }  
}

//获取鼠标宏
async function Get_MS_Macro(index) {
  await Get_MS_MacroName(index);
  await Get_MS_MacroContext(index);
}

//保留：暂时没用上
async function Set_MS_RFTXTime(value) {
  var flag = await Get_Device_Online_With_Dialog() ;

  if(flag == true)
    await Set_Device_Eeprom_Value(0xBB,value);  

  return flag;
}

//设置为Visit模式之后将不会下发和读取USBS数据
function Set_Visit_Mode(flag) {
  visit = flag;
}

function Set_DriverOnline(flag) {
  driverOnlineFlag = flag;
}

export default {
  /*
  Request_Device(filters)

  Request device
  parameter:
  var filters = [];
  var filter = {
    vendorId: Number.parseInt("0x3554"),
    productId: Number.parseInt("0xF516"),
  }
  filters.push(filter);

  returns:
  true:device connect 
  false：device disconnect
  */
  Request_Device,

  /*
  Device_Connect();
  Device connect
  parameter：null
  returns:null
  */  
  Device_Connect,

  /*
  Get_HistoryDevicesInfo();
  Get historyDevicesInfo
  parameter：null
  returns:historyDevicesInfo
  */
  Get_HistoryDevicesInfo,

  /*
  Device_Reconnect(temp);
  Device reconnect
  parameter：temp
  returns:null
  */
  Device_Reconnect,

  /*
  Write_Mouse_Flash(buffer);
  Write Mouse Flash
  parameter：
  var buffer = [];

  returns:
  false:device offline
  true: device online
  */
  Write_Mouse_Flash,

  /*
  Device_Close();
  Device close:close driver or connect timeout
  parameter：null
  returns:null
  */    
  Device_Close,

  /*
  Set_MS_KeyFunction(index,keyFunction)
  Set mouse keyfunction 
  parameter：
  index:current set key index
             keyFunction:
             example:left click
             var keyFunction = {
              type:MouseKeyFunction.MouseKey
              param:0x0100
             }

  returns:
  false:device offline
  true: device online
  */  
  Set_MS_KeyFunction,

  /*
  Set_MS_DebounceTime(value);
  Set Mouse Debounce Time
  parameter：
  var value = 8;
  returns:false:device offline
          true: device online
  */
  Set_MS_DebounceTime,

  /*
  Set_MS_Multimedia(index,multimedia);
  Set mouse key Multimedia
  parameter：
  index:current set key index
  multimedia:
  example Volume+:
  var multimedia = 0x00E9;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_Multimedia,

  /*
  Set_MS_ShortcutKey(index,shortCut);
  Set mouse key Shortcut
  parameter：
  index:current set key index
  multimedia:
  example Ctrl+A:
  var shortCut = ["LCtrl","A"];

  returns:
  false:device offline
  true: device online
  */
  Set_MS_ShortcutKey,

  /*
  Set_MS_MacroName(index,name);
  Set mouse macro name
  parameter：
  index:current set key index
  multimedia:
  example hello:
  var name = "hello"

  returns:
  false:device offline
  true: device online
  */
  Set_MS_MacroName,

  /*
  Set_MS_MacroContext(index,contexts);
  Set mouse macro contexts
  parameter：
  index:current set key index
  contexts:
  example :
  A     press   50ms
  A     release 123ms
  Ctrl  


  returns:
  false:device offline
  true: device online
  */
  Set_MS_MacroContext,

  /*
  Set_MS_Macro(index,macro);
  Set mouse key to macro
  parameter：
  index:current set key index
  macro:

  returns:
  false:device offline
  true: device online
  */  
  Set_MS_Macro,

  /*
  Restore_MS_Macro(index);
  Restore mouse key(index) macro
  parameter：
  index:current set key index

  returns:
  false:device offline
  true: device online
  */  
  Restore_MS_Macro,

  /*
  Set_MS_ReportRate(value);
  Set mouse ReportRate
  parameter：
  example 125Hz
  var value = 125;

  returns:
  false:device offline
  true: device online
  */ 
  Set_MS_ReportRate,

  /*
  Set_MS_MaxDPI(value);
  Set mouse max dpi
  parameter(max 8)：
  example 5
  var value = 5;

  returns:
  false:device offline
  true: device online
  */ 
  Set_MS_MaxDPI,

  /*
  Set_MS_CurrentDPI(value);
  Set mouse current dpi
  parameter(max (MaxDPI - 1)))：
  example 5
  var value = 5;

  returns:
  false:device offline
  true: device online
  */ 
  Set_MS_CurrentDPI,

  /*
  Set_MS_DPIValue(index,value);
  Set mouse dpi value
  parameter：
  index:current set dpi stage index
  var value = 500;

  returns:
  false:device offline
  true: device online
  */ 
  Set_MS_DPIValue,

  /*
  Set_MS_DPIColor(index,color);
  Set mouse dpi color
  parameter：
  index:current set dpi stage index
  example:red,rgb(255,0,0)
  var value = "rgb(255,0,0)";

  returns:
  false:device offline
  true: device online
  */ 
  Set_MS_DPIColor,

  /*
  Sensor Setting:
  TODO:not all sensor have the following Settings(For details please see"sensor.json")
  */
  /*
  Set_MS_SensorMode(value);
  Set mouse sensor mode
  parameter：
  0:LP
  1:HP
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_SensorMode,

  Set_MS_AngleTune, 

  /*
  Set_MS_SensorFPS20K(value);
  Set mouse sensor fps 20k
  parameter：
  0:off
  1:on
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_SensorFPS20K,

  /*
  Set_MS_LOD(value);
  Set mouse LOD
  parameter：
  0:1mm
  1:2mm
  3:0.7mm(only sensor 3395)
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LOD,

  /*
  Set_MS_PerformanceState(value);
  Set mouse Performance State
  parameter：
  0:off
  1:on
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_PerformanceState,

  /*
  Set_MS_PerformanceTime(value);
  Set mouse Performance time
  parameter：
  time = value * 10(uint 1s);
  example: 30
  var value = 3;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_PerformanceTime,

  /*
  Set_MS_Angle(value);
  Set mouse Angle snap
  parameter：
  0:off
  1:on
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_Angle,

  /*
  Set_MS_Ripple(value);
  Set mouse Ripple control
  parameter：
  0:off
  1:on
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_Ripple,

  /*
  Set_MS_MotionSync(value);
  Set mouse Motion Sync
  parameter：
  0:off
  1:on
  var value = 0;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_MotionSync,


  /*
  Set_MS_DPILightMode(value);
  Set mouse dpi light mode
  parameter：
  1:Steady
  2:Breathing
  var value = 1;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_DPILightMode,

  /*
  Set_MS_DPILightBrightness(value);
  Set mouse dpi light brightness
  parameter(1-10)：
  1:dark
  10:light
  var value = 5;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_DPILightBrightness,

  /*
  Set_MS_DPILightSpeed(value);
  Set mouse dpi light speed
  parameter(1-5)：
  1:slow
  10:fase
  var value = 5;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_DPILightSpeed,

  /*
  Set_MS_DPILightOff();
  Set mouse dpi light off

  returns:
  false:device offline
  true: device online
  */
  Set_MS_DPILightOff,

  // 灯光页
  /*
  Set_MS_LightColor(color);
  Set mouse light color
  parameter：
  example:red rgb(255,0,0)
  var value = "rgb(255,0,0)";

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LightColor,

  /*
  Set_MS_LightMode(value);
  Set mouse light mode
  parameter：
  0x00: Off（speed ×，brightness ×，color ×）
  0X01: Rainbow（default）（speed √，brightness √，color ×）
  0X02: Single Color Breath（speed √，brightness √，color √）
  0X03: Fixed Color（speed ×，brightness √，color √）
  0X04: Neon（speed √，brightness √，color ×）
  0X05: Rainbow Breath（speed √，brightness √，color ×）
  0X06: Fixed Rainbow（speed √，brightness √，color ×）
  var value = 1;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LightMode,

  /*
  Set_MS_LightBrightness(value);
  Set mouse light brightness
  parameter(0-9)：
  var value = 1;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LightBrightness,

  /*
  Set_MS_LightSpeed(value);
  Set mouse light speed
  parameter(0-9)：
  var value = 1;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LightSpeed,

  /*
  Set_MS_MovingOffState(value);
  Set mouse Turn off lights while moving
  parameter：
  0:off
  1:on
  var value = 1;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_MovingOffState,

  /*
  Set_MS_LightOffTime(value);
  Set mouse time until lights turn off after stationary
  parameter：
  time = value * 10(uint 1s);
  example: 30
  var value = 3;

  returns:
  false:device offline
  true: device online
  */
  Set_MS_LightOffTime,
  Set_MS_LightPowerSave,

  /*
  Get_Device_Info();
  Set device info

  returns:
  info = {
  cid:1,
  mid:1
  type:1
  }
  cid:customer id
  mid:moudle id
  type:
  0:dongle 1K, 
  1:dongle 4K, 
  2:wired 1K  
  3:wired 8K 
  4:dongle 2K 
  5:dongle 8K  
  */
  Get_Device_Info,

  Set_PC_Satae,

  Get_Device_Battery,
  Set_Pair_CID,
  /*
  Set_Device_EnterPairMode();
  Set device enter pair mode
  */
  Set_Device_EnterPairMode,

  /*
  Get_Device_PairResult();
  Get device pair result
  */
  Get_Device_PairResult,

  /*
  Device_Restore();
  Set device Restore
  */
  Device_Restore,

  /*
  Set_Device_Profile(value);
  Set device Profile
  parameter:(0-3,some mcu not support)

  var value = 1;
  */
  Set_Device_Profile,

  /*
  Set_Device_LongDistance(value);
  Set device Long Distance
  parameter:
  0:off
  1:on
  var value = 1;
  */
  Set_Device_LongDistance,

  Set_Device_4KDongleRGBMode,
  Set_Device_LightMode,
  Set_Device_LightColor,
  Set_Device_LightSpeed,
  Set_Device_LightBrightness,
  Set_Device_LightTime,

  Set_Dongle_3RGBMode,

  Index_To_DPILightBrightness,
  DPILightBrightness_To_Index,

  /*
  Set_Visit_Mode(value);
  Set driver visit mode
  parameter:
  0:off
  1:on
  var value = 1;
  */
  Set_Visit_Mode,

  Set_DriverOnline,

  /*fllowing is parameter */
  /*device flash data */
  flashData,
  /*device information */
  deviceInfo,
  /*device pair result */
  pairResult,
  /*current device pid */
  devicePID,
  /*driver visit mode */
  visit,
  driverOnlineFlag,

  /*fllowing is define */
  DevicePairResult,
  MouseKeyFunction,
  DeviceConectState,
}