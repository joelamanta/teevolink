//字符串转16禁止
function String_To_Hex(hexString) {
  return parseInt(hexString, 16);
}

/*
0x08:125Hz,
0x04:250Hz,
0x02:500Hz,
0x01:1000Hz,
0x10:2000Hz,
0x20:4000Hz,
0x40:8000Hz,
*/
function ReportRate_To_FlashData(reportRate) {
  var value = 0x01;
  if(reportRate > 1000) {
    value = reportRate / 1000 * 0x10;
  }
  else {
    value = 1000 / reportRate;
  }

  return value;
}

function FlashData_To_ReportRate(value) {
  var reportRate = 1000;
  if(value >= 0x10) {
    reportRate = (value / 0x10) * 2000;
  }
  else {
    reportRate = 1000 / value;
  }

  return reportRate;
}

//数组转rgb
function Buffer_To_Color(buffer,index) {
  var r = buffer[index];
  var g = buffer[index + 1];
  var b = buffer[index + 2];
  var color = `rgb(${r}, ${g}, ${b})`;
  return color;
}

//rgb转数组
function Color_To_Buffer(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    // 将匹配到的字符串转换为整数并返回数组
    return [
      parseInt(match[1], 10), // Red
      parseInt(match[2], 10), // Green
      parseInt(match[3], 10)  // Blue
    ];
  }
  return [0,0,0];
}

function LightMode_To_Disable(mode) {
/*
  0x00: 关闭（不支持调速，不支持调亮度，不支持调颜色）
  0X01: 彩色流动（默认）（支持调速、调亮度，不支持调颜色）
  0X02: 单色呼吸（支持调速、调亮度、调颜色）
  0X03: 单色常亮（支持调亮度、颜色，不支持调速度）
  0X04: 霓虹（支持调速、调亮度，不支持调颜色）
  0X05: 混彩呼吸（支持调速、调亮度，不支持调颜色）
  0X06: 炫彩常亮（支持调速、调亮度，不支持调颜色）
  */
  var disables = {
    color:false,
    brightness:false,
    speed:false
  };

  switch (mode)
  {
      case 0:
        disables.color = true;
        disables.brightness = true;
        disables.speed = true;
        break;

      case 1:
      case 4:
      case 5:
        disables.color = true;
        break;

      case 6:
        disables.color = true;
        disables.speed = true;
        break;

      case 2:
        break;

      case 3:
        disables.speed = true;
        break;

      default:
        break;
  }

  return disables;
}

//字符串转utf-8，中文占3个byte
function String_To_UTF8(string) {
  const encoder = new TextEncoder();

  return encoder.encode(string);
}

//utf-8转字符串
function UTF8_To_String(buff) {
  const decoder = new TextDecoder();
  
  return decoder.decode(buff);
}

function Deep_Clone_Array(arr) {
  return arr.map(item => {
    if (Array.isArray(item)) {
      return Deep_Clone_Array(item);
    } else if (typeof item === 'object' && item !== null) {
      return Deep_Clone_Object(item);
    } else {
      return item;
    }
  });
}

function Deep_Clone_Object(obj) {
  let result = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = Deep_Clone_Object(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export default{
  String_To_Hex,
  ReportRate_To_FlashData,
  FlashData_To_ReportRate,
  Buffer_To_Color,
  Color_To_Buffer,
  LightMode_To_Disable,
  String_To_UTF8,
  UTF8_To_String,
  Deep_Clone_Array,
}