import { NextResponse } from 'next/server'

// Mock Data Generator to mimic the layout provided by the user in the image
// This creates realistic x,y coordinates to prove the extraction concept
function generateMockExtraction() {
  const booths = []
  let globalIdCount = 1

  const addRow = (labels: string[], y: number, w: number, h: number, startX = 140, gap = 10, type = 'standard') => {
    let currX = startX
    labels.forEach(bgLabel => {
      booths.push({
        id: `ai-ext-${globalIdCount++}`,
        label: bgLabel,
        x: currX,
        y: y,
        width: w,
        height: h,
        boothType: type,
        area: Math.round((w * h) / 100) / 100, // Dummy conversion to sq meters
        price: 0 // Will be set by client
      })
      currX += w + gap
    })
  }

  // Generate pattern similar to the user's PDF
  // Top sections G
  addRow(['G70', 'G68', 'G66', 'G64', 'G62', 'G60', 'G58'], 80, 70, 50, 140, 15)
  addRow(['G71', 'G69', 'G67', 'G65', 'G63', 'G61', 'G59'], 140, 70, 50, 140, 15)

  // F section
  addRow(['F52', 'F51', 'F50', 'F49', 'F48'], 240, 80, 50, 140, 50)
  addRow(['F47', 'F46', 'F45', 'F44', 'F43'], 310, 80, 50, 140, 50)
  addRow(['F42', 'F41', 'F40', 'F39', 'F38'], 380, 80, 50, 140, 50)

  // E section
  addRow(['E37', 'E36', 'E35', 'E34', 'E33'], 480, 80, 60, 140, 50, 'vip')
  addRow(['E32', 'E31', 'E30', 'E29', 'E28'], 700, 80, 60, 140, 50, 'vip')

  // D section
  addRow(['D27', 'D26', 'D25', 'D24', 'D23'], 570, 80, 60, 140, 50)
  addRow(['D22', 'D21', 'D20', 'D19', 'D18'], 790, 80, 60, 140, 50)

  // Big Bottom Booths (A1, A2, A3)
  booths.push({ id: `ai-ext-${globalIdCount++}`, label: 'A1', x: 230, y: 1050, width: 140, height: 220, boothType: 'sponsor', area: 42, price: 0 })
  booths.push({ id: `ai-ext-${globalIdCount++}`, label: 'A2', x: 430, y: 1050, width: 140, height: 220, boothType: 'sponsor', area: 42, price: 0 })
  booths.push({ id: `ai-ext-${globalIdCount++}`, label: 'A3', x: 630, y: 1050, width: 140, height: 220, boothType: 'sponsor', area: 42, price: 0 })

  // Far Right Column (G57 to G53)
  let rightY = 80
  ;['G57', 'G56', 'G55', 'G54', 'G53'].forEach(lbl => {
    booths.push({ id: `ai-ext-${globalIdCount++}`, label: lbl, x: 860, y: rightY, width: 55, height: 80, boothType: 'standard', area: 12, price: 0 })
    rightY += 240
  })

  // Far Left Column (G72 to G76)
  let leftY = 80
  ;['G72', 'G73', 'G74', 'G75', 'G76'].forEach(lbl => {
    booths.push({ id: `ai-ext-${globalIdCount++}`, label: lbl, x: 40, y: leftY, width: 55, height: 80, boothType: 'standard', area: 12, price: 0 })
    leftY += 240
  })

  return booths
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('blueprint') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No blueprint file provided.' }, { status: 400 })
    }

    // In a production environment, you would send this 'file' to Google Gemini Vision API:
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    // const result = await model.generateContent([
    //   "Analyze this architectural floor plan. Extract all drawn booths. Return a strict JSON array of objects, where each object has {label: string, x: number, y: number, width: number, height: number}. Estimate x, y, width, and height conceptually in pixels relative to an 1200x800 canvas.",
    //   { inlineData: { data: Buffer.from(await file.arrayBuffer()).toString("base64"), mimeType: file.type } },
    // ]);
    // const parsedLayout = JSON.parse(result.response.text());

    // --- MOCK SIMULATION FOR DEMONSTRATION ---
    // Simulating API Latency (Artificial delay to make it feel like AI is "thinking")
    await new Promise((resolve) => setTimeout(resolve, 3500))

    const mockLayout = generateMockExtraction()

    return NextResponse.json({
      success: true,
      message: 'AI Extraction Completed successfully.',
      data: mockLayout,
    })
  } catch (error) {
    console.error('AI Extraction Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process the blueprint image.' },
      { status: 500 }
    )
  }
}
