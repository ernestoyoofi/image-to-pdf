import { useEffect, useState } from "react"
import AddingImage from "./ui/AddingImage"
import ApplyLanguage from "./LanguageSelect"
import { SnackbarProvider, enqueueSnackbar } from "notistack"
import ImageCanvas from "./ui/ImageCanvas"

export default function App() {
  const [image, setImage] = useState([])
  const [allowEditor, setEditorOpen] = useState(false)
  const [sizePaper, setSizePaper] = useState("A4")
  const [rotation, setRotation] = useState("portrait")
  const [paddingPaper, setPaddingPaper] = useState("no")

  useEffect(() => {
    function isDarkMode() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if(isDarkMode()) {
      document.body.setAttribute("dark-mode","!")
    }

    document.querySelector('title').innerText = ApplyLanguage("title")
    document.querySelector('meta[name="description"]').setAttribute("content", ApplyLanguage("description"))
  }, [])

  async function fileURLBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      reader.onerror = (err) => {
        reject(err)
      }
      reader.readAsDataURL(file)
    })
  }

  function AddingImageBtn() {
    const inputs = document.createElement("input")
    inputs.type = "file"
    inputs.multiple = true
    inputs.addEventListener("change", async () => {
      const formArray = Array.from(inputs.files)
      for(let dataImgForm of formArray) {
        try {
          const dataimg = await fileURLBase64(dataImgForm)
          let imgData = image
          imgData.push({key: image.length, name: dataImgForm.name, uri: dataimg})
          setImage([...imgData])
          if((formArray.length - 1) == image.length || formArray.length == 1) {
            // Apply Editor
            setEditorOpen(true)
          }
        } catch(err) {
          enqueueSnackbar(err.message,{variant:"error"})
        }
      }
    })
    inputs.click()
  }

  function removeImageByIndex(index) {
    setImage(image.filter(a => a.key != index))
  }

  return <SnackbarProvider anchorOrigin={{
    vertical: 'top',
    horizontal: 'center',
  }}>
    {!allowEditor? <AddingImage
      action_btn={AddingImageBtn}
    /> : <ImageCanvas
      cancelAll={() => {
        setImage([])
        setEditorOpen(false)
        enqueueSnackbar(ApplyLanguage("cancel_operational")+"...",{variant:"success"})
      }}
      rotation={rotation}
      setRotation={setRotation}
      sizePaper={sizePaper}
      setSizePaper={setSizePaper}
      paddingPaper={paddingPaper}
      setPaddingPaper={setPaddingPaper}
      listImage={image}
      removeImage={removeImageByIndex}
    />}
  </SnackbarProvider>
}