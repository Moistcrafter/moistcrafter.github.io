const cyka = {
  А: "A",
  а: "a",
  Б: "6",
  б: "6",
  В: "B",
  в: "B",
  Г: "r",
  г: "r",
  Д: "A",
  д: "A",
  Е: "E",
  е: "e",
  Ё: "E",
  ё: "E",
  Ж: "*",
  ж: "*",
  З: "3",
  з: "3",
  И: "N",
  и: "N",
  Й: "N",
  й: "N",
  К: "K",
  к: "k",
  Л: "n",
  л: "n",
  М: "M",
  м: "m",
  Н: "H",
  н: "H",
  О: "O",
  о: "o",
  П: "n",
  п: "n",
  Р: "P",
  р: "p",
  С: "C",
  с: "c",
  Т: "T",
  т: "T",
  У: "y",
  у: "y",
  Ф: "qp",
  ф: "qp",
  Х: "X",
  х: "x",
  Ц: "U",
  ц: "u",
  Ч: "4",
  ч: "4",
  Ш: "W",
  ш: "w",
  Щ: "W",
  щ: "w",
  Ъ: "b",
  ъ: "b",
  Ы: "bl",
  ы: "bl",
  Ь: "b",
  ь: "b",
  Э: "3",
  э: "3",
  Ю: "I-O",
  ю: "I-O",
  Я: "R",
  я: "R",
};

const inputBox = document.getElementById("inputBox");
const clearButton = document.getElementById("clearButton");
const convertButton = document.getElementById("convertButton");
const copyButton = document.getElementById("copyButton");
const outputBox = document.getElementById("outputBox");
const pasteButton = document.getElementById("pasteButton");

function ktoPyccknn(inputString) {
  const result = [];
  for (const char of inputString) {
    if (char in cyka) {
      result.push(cyka[char]);
    } else {
      result.push(char);
    }
  }
  return result.join("");
}

function updateOutput() {
  const inputText = inputBox.value;
  const outputText = ktoPyccknn(inputText);
  outputBox.value = outputText;
}

clearButton.addEventListener("click", function () {
  inputBox.value = "";
  outputBox.value = "";
});

inputBox.addEventListener("input", updateOutput);
convertButton.addEventListener("click", updateOutput);

copyButton.addEventListener("click", function () {
    outputBox.focus();
  navigator.clipboard
    .writeText(outputBox.value)
    .then(function () {
      console.log("Text copied to clipboard");
    })
    .catch(function (err) {
      console.error("Unable to copy:", err);
    });
});

pasteButton.addEventListener("click", function () {
  navigator.clipboard
    .readText()
    .then(function (clipboardText) {
      inputBox.value = clipboardText;
      updateOutput();
    })
    .catch(function (err) {
      console.error("Failed to read clipboard data: ", err);
    });
});
