import Script from "next/script";

export default function TawkToWidget({
  propertyId,
  widgetId,
}: {
  propertyId: string;
  widgetId: string;
}) {
  if (!propertyId) return null;

  return (
    <Script id="tawkto-widget" strategy="afterInteractive">
      {`
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        (function () {
          var s1 = document.createElement("script"), s2 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = 'https://embed.tawk.to/${propertyId}/${widgetId || "default"}';
          s1.charset = 'UTF-8';
          s1.setAttribute('crossorigin', '*');
          s2.parentNode.insertBefore(s1, s2);
        })();
      `}
    </Script>
  );
}
