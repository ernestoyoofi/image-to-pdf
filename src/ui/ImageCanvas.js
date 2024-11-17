import { useEffect, useRef, useState } from "react"
import ApplyLanguage from "../LanguageSelect"
import "./ImageCanvas.css"
import { GoPencil } from "react-icons/go"
import { PiFilePdfThin } from "react-icons/pi"
import { jsPDF } from "jspdf"

const listSize = {
  "A2": {
    landscape: [594, 420],
    portrait: [420, 594],
  },
  "A3": {
    landscape: [420, 297],
    portrait: [297, 420],
  },
  "A4": {
    landscape: [297, 210],
    portrait: [210, 297],
  },
  "Letter": {
    landscape: [11 * 72, 8.5 * 72],
    portrait: [8.5 * 72, 11 * 72],
  },
  "SemiLetter": {
    landscape: [8 * 72, 5.5 * 72],
    portrait: [5.5 * 72, 8 * 72],
  }
}
const paddingValues = {
  no: 0,
  small: 10,
  mid: 20,
  big: 40,
}
const paperSizes = {
  A4: { width: 210, height: 297 }, // dalam mm
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  Letter: { width: 216, height: 279 },
  SemiLetter: { width: 139, height: 216 },
};
const cmToPx = (mm) => (mm * (window.devicePixelRatio * 96 / 25.4))

function CanvasControl({ width, height, size, data, padding, rotation }) {
  const refImage = useRef()
  useEffect(() => {
    function BuildingCanvasImageRendering(size, padding, rotationDegrees) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
    
      const paperSize = paperSizes[size]
      if (!paperSize) throw new Error("Ukuran kertas tidak valid")
      canvas.width = rotation === "landscape"? cmToPx(paperSize.height) : cmToPx(paperSize.width)
      canvas.height = rotation === "landscape"? cmToPx(paperSize.width) : cmToPx(paperSize.height)
      canvas.style.width = `${paperSize.width}cm`
      canvas.style.height = `${paperSize.height}cm`
    
      const paddingValueC = parseInt(paddingValues[padding])
      const rotationRadians = (rotationDegrees * Math.PI) / 180
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
  
      const img = new Image()
      img.src = data.uri
      img.onload = () => {
        const availableWidth = canvas.width - 2 * paddingValueC
        const availableHeight = canvas.height - 2 * paddingValueC
        const scale = Math.min(availableWidth / img.width, availableHeight / img.height);
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(rotationRadians)
        ctx.drawImage(
          img,
          -((img.width * scale) / 2),
          -((img.height * scale) / 2),
          img.width * scale,
          img.height * scale
        )
        ctx.restore()
        const dataImg = canvas.toDataURL("image/jpeg")
        if (refImage && refImage.current) {
          refImage.current.setAttribute("src", dataImg)
        } else {
          console.error("refImage is not valid.")
        }
      }
      img.onerror = (e) => {
        console.error("Gambar gagal dimuat.", e)
      }
      const dataImg = canvas.toDataURL("image/jpeg")
      refImage.current.setAttribute("src", dataImg)
      refImage.current.setAttribute("c-width", canvas.width)
      refImage.current.setAttribute("c-height", canvas.height)
    }
    BuildingCanvasImageRendering(size, padding, 0)
  }, [width, height, padding, size, data.uri, rotation])

  return <div className="list-card" key={data.key}>
    <div className="card-canvas" style={{ width: width+"px", height: height+"px" }}>
      <img ref={refImage} alt="Canvas" />
    </div>
  </div>
}

export default function ImageCanvas({ removeImage, cancelAll, listImage, sizePaper, setSizePaper, rotation, setRotation, paddingPaper, setPaddingPaper }) {
  const [openMenu, openHeightMenu] = useState(true)

  async function exportToPdf() {
    const sizePaperFormat = {
      width: cmToPx(paperSizes[sizePaper].width),
      height: cmToPx(paperSizes[sizePaper].height)
    }
    const sizePaperQuick = [sizePaperFormat.width, sizePaperFormat.height]
    const pdf = new jsPDF({
      orientation: rotation === "portrait" ? "p" : "l",
      unit: "pt",
      format: sizePaperQuick,
    })
    document.querySelectorAll('main .card-canvas img').forEach((canvas, i) => {
      const widthCa = Number(parseInt(canvas.getAttribute("c-width")))
      const heightCa = Number(parseInt(canvas.getAttribute("c-height")))
      if(i !== 0) {
        pdf.addPage(sizePaperQuick, rotation)
      }
      pdf.addImage(
        canvas.src,
        "JPEG", 0, 0,
        widthCa,
        heightCa,
      )
    })
    pdf.save(`Image-${crypto.randomUUID()}.pdf`)
  }

  return <div className="box-container">
    <div className="responsive">
      <main>
        {listImage.map((dataImg) => (
          <CanvasControl
            remove={removeImage}
            key={dataImg.key}
            rotation={rotation}
            width={rotation === "landscape"? 420:297}
            height={rotation === "landscape"? 297:420}
            size={sizePaper}
            data={dataImg}
            padding={paddingPaper}
          />
        ))}
      </main>
      <div className="boxing-center-control">
        <div className="container-control" style={{ marginBottom: `-${openMenu? 400 : 0}px` }}>
          <header className="header-control">
            <h2>{ApplyLanguage("settings")}</h2>
            <div className="header-control-btn">
              {openMenu && <button onClick={exportToPdf}><PiFilePdfThin size={24}/></button>}
              <button onClick={() => {
                openHeightMenu(!openMenu)
              }}><GoPencil size={20}/></button>
            </div>
          </header>
          <div className="content-control">
            <button className="export-pdf" onClick={exportToPdf}>{ApplyLanguage("export_pdf")}<PiFilePdfThin size={24} style={{marginLeft: 9}}/></button>
            <label className="label-control">{ApplyLanguage("padding_paper")}</label>
            <select onChange={(e) => {
              setPaddingPaper(e.target.value?.toLowerCase()?.split(" ")[0]?.trim())
            }}>
              {Object.keys(paddingValues).map((size, i) => (
                <option key={`option-padding-${i}`} value={size}>{ApplyLanguage(`padding_paper_${size}`)}</option>
              ))}
            </select>
            <label className="label-control">{ApplyLanguage("rotate")}</label>
            <select onChange={(e) => {
              setSizePaper(e.target.value)
            }}>
              {Object.keys(listSize).map((size, i) => (
                <option key={`option-size-${i}`}>{size}</option>
              ))}
            </select>
            <label className="label-control">{ApplyLanguage("change_paper")}</label>
            <select onChange={(e) => {
              setRotation(e.target.value?.toLocaleLowerCase())
            }}>
              <option>Portrait</option>
              <option>Landscape</option>
            </select>
            <label className="label-control">{ApplyLanguage("cancel_operational")}</label>
            <button onClick={cancelAll} style={{background:"red",color:"white",borderColor:"red"}}>{ApplyLanguage("cancel_operational")}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
}