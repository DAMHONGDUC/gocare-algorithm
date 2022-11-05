function addTemplate(dataAllTemplate, data) {
  if (dataAllTemplate.push(data)) {
    return true;
  } else {
    return false;
  }
}

function countPrioritySuitable(result, max) {
  var d = 0;
  for (let data of result) {
    if (data.priority === max) d++;
  }
  return d;
}

function getPrioritySuitable(result, priority) {
  return result.find((e) => e.priority === priority).id;
}

function getResponseFromId(id, dataAllTemplate, input) {
  var response = dataAllTemplate.find((e) => e.id === id).content;
  response = response.replaceAll(NAME_PLACEHOLER, input.arguments.name);
  return response;
}

function getResponse(input, dataAllTemplate) {
  var result = [];
  var max = 0;
  var response;
  var message = input.message;
  for (let data of dataAllTemplate) {
    let priorityCount = 0;
    for (let trigger of data.triggers) {
      let messageConverted = removeVietnameseTones(message).toLowerCase();
      let keywordConverted = removeVietnameseTones(
        trigger.keyword
      ).toLowerCase();
      if (messageConverted.includes(keywordConverted))
        priorityCount = priorityCount + trigger.priority;
    }
    result.push({ id: data.id, priority: priorityCount });
    if (max < priorityCount) max = priorityCount;
  }
  if (countPrioritySuitable(result, max) == 1) {
    response = getResponseFromId(
      getPrioritySuitable(result, max),
      dataAllTemplate,
      input
    );
  } else if (countPrioritySuitable(result, max) > 1) {
    //console.log("have > 1 template suitable");
    response = getResponseFromId(
      getPrioritySuitable(result, max),
      dataAllTemplate,
      input
    );
  } else {
    //console.log("no template suitable");
    response = "Not Found";
  }
  return response;
}

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

const NAME_PLACEHOLER = "{{name}}";

function run() {
  // example data
  var dataTemplate1 = {
    id: 1,
    type: 1,
    name: "Chẩn đoán COVID",
    content:
      "Chào {{name}},\nVới thông tin mà {{name}} cung cấp, có thể {{name}} đã bị COVID.",
    triggers: [
      {
        keyword: "sốt",
        priority: 4,
      },
      {
        keyword: "ho khan",
        priority: 6,
      },
      {
        keyword: "ho",
        priority: 4,
      },
      {
        keyword: "mất vị giác",
        priority: 9,
      },
    ],
    arguments: ["name", "vocative"],
    threshold: 15,
  };

  var dataTemplate2 = {
    id: 2,
    type: 1,
    name: "Chẩn đoán Viêm Gan",
    content:
      "Chào {{name}},\nVới thông tin mà {{name}} cung cấp, có thể {{name}} đã bị Viêm Gan.",
    triggers: [
      {
        keyword: "buồn nôn",
        priority: 4,
      },
      {
        keyword: "nước tiểu có màu tối",
        priority: 6,
      },
      {
        keyword: "đau khớp",
        priority: 4,
      },
      {
        keyword: "da vàng",
        priority: 9,
      },
    ],
    arguments: ["name", "vocative"],
    threshold: 15,
  };

  var input = {
    message:
      "toi gan day bi mat vi giac, va nhieu luc bi ho khan nua. bac si tu van giup toi voi",
    arguments: {
      name: "Ngọc Ngô",
      gender: "male",
      age: null,
    },
  };

  // an array that store all template
  var dataAllTemplate = [];

  // add template: phần add này dùng hàm hẹ thống
  addTemplate(dataAllTemplate, dataTemplate1);
  addTemplate(dataAllTemplate, dataTemplate2);
  //console.log(dataAllTemplate);

  // get response
  var response = getResponse(input, dataAllTemplate);
  console.log(response);
}

run();
