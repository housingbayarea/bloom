export const testScriptOne = () => {
  const gtmKey = process.env.gtmKey
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmKey}`
  return script
}

export const testScriptTwo = () => {
  const gtmKey = process.env.gtmKey
  const script = document.createElement("script")
  script.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${gtmKey}');`
  return script
}

// export const testScriptTwo = () => {
// }

export const headScript = () => {
  const gtmKey = process.env.gtmKey
  if (gtmKey) {
    return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gtmKey}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', '${gtmKey}');
    </script>
    `
  } else {
    return ""
  }
}

export const bodyTopTag = () => {
  const gtmKey = process.env.gtmKey
  if (gtmKey) {
    return `
    <noscript><iframe height="0" src="//www.googletagmanager.com/ns.html?id=${gtmKey}" style="display:none;visibility:hidden" width="0"></iframe></noscript>
  `
  } else {
    return ""
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const pageChangeHandler = (url: any) => {
  // Customize this if you need to do something on page changes
  // after the initial site load
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */
