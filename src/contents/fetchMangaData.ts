export const config = {
  matches: ["<all_urls>"]
}

console.log("kollect content script loaded")
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "add_manga") return

  const scrollPercentage =
    (window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight)) *
    100

  const title = document.title
  const url = window.location.href
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") ?? ""

  const selects = document.querySelectorAll("select")
  const selectsData = [...selects].map((select) => {
    const opt = select.selectedOptions?.[0] ?? null

    return {
      name: select.name,
      value: opt?.value ?? "",
      text: opt?.text ?? ""
    }
  })

  const scrollPercentageData = Number(scrollPercentage.toFixed(2))

  const data = {
    title: title || "",
    url: url || "",
    ogTitle,
    selects: selectsData,
    scrollPercentage: scrollPercentageData || 0
  }

  console.log("kollect:", data)
  sendResponse(data)

  return true
})

export {}
