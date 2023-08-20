import { useState, useEffect } from "preact/hooks";
import "./app.css";
var w = window.innerWidth;
var h = window.innerHeight;
const supabaseUrl = "https://sucqmfvbeonstichlfik.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Y3FtZnZiZW9uc3RpY2hsZmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzNTkyMDQsImV4cCI6MjAwNzkzNTIwNH0.CiCtIOkNezJkuJ-bfdDT9ssj2knTZwGNzWWOKp5tHww";
const sb = supabase.createClient(supabaseUrl, supabaseKey);
export function App() {
  const [selectedPin, setSelectedPin] = useState(0);
  const [links, setLinks] = useState({});
  const [pinsById, setPinsById] = useState({});
  const [linksSorted, setLinksSorted] = useState([]);
  useEffect(async () => {
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      .then((data) => {
        var map = L.map("map").setView([25, -90], 3);
        console.log("ffs");
        var tiles = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        ).addTo(map);
        var popup = L.popup()
          .setLatLng([51.513, -0.09])
          .setContent("I am a standalone popup.");

        function onMapClick(e) {
          popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
        }
        sb.from("pins")
          .select("*")
          .then(({ data }) => {
            let pinDict = {};
            for (let i = data.length; i--; i > -1) {
              const { id, lat, long } = data[i];
              pinDict[id] = data[i];
              var m = L.marker([lat, long]).addTo(map);
              m.on("click", (e) => setSelectedPin(id));
              // .bindPopup(
              //   "<b>" +
              //     profil +
              //     ": " +
              //     place +
              //     ". " +
              //     dt.toLocaleDateString() +
              //     "</b><br /><a href='" +
              //     link +
              //     "'>pokernet-link</a>"
              // );
            }
            setPinsById(pinDict);
            sb.from("links")
              .select("*")
              .then((res) => {
                const data2 = res.data;
                let newLinks = {};
                let allLinks = [];
                console.log(data2);
                for (var i = 0; i < data2.length; i++) {
                  const link = data2[i];
                  const newEl = { ...link, dt: new Date(link.visitdate) };
                  allLinks.push(newEl);
                  if (newLinks[link.pinid] === undefined)
                    newLinks[link.pinid] = [];
                  newLinks[link.pinid].push(newEl);
                }
                setLinks(newLinks);
                setLinksSorted(allLinks.sort((a, b) => b.dt - a.dt));
              });
          });

        map.on("click", onMapClick);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  console.log(linksSorted, selectedPin, links);
  return (
    <>
      <div
        id="map"
        style={{ height: h - 20 + "px", width: w - 210 + "px" }}
      ></div>{" "}
      {linksSorted.length > 0 && (
        <div
          style={{
            height: h - 20 + "px",
            width: 200 + "px",
            position: "absolute",
            left: w - 200,
            top: 10,
          }}
        >
          {selectedPin ? (
            <>
              <h2>{pinsById[selectedPin].place}</h2>
              {(links[selectedPin] || []).map((link) => (
                <>
                  <a href={link.link}>
                    {link.profile + " (" + link.dt.toLocaleDateString() + ")"}
                  </a>
                  <br />
                </>
              ))}
            </>
          ) : (
            <>
              <h2>Sidste besøg</h2>
              {linksSorted.map((link) => (
                <>
                  <a href={link.link}>
                    {link.profile +
                      ": " +
                      pinsById[link.pinid].place +
                      " (" +
                      dateToStr(link.dt) +
                      ")"}
                  </a>
                  <br />
                </>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
const dateToStr = (dt) => {
  let str = dt.getDate() + "/" + (dt.getMonth() + 1).toString();
  if (new Date().getFullYear() !== dt.getFullYear()) str += dt.getFullYear();
  return str;
};
const loadScript = (FILE_URL, async = true, type = "text/javascript") => {
  return new Promise((resolve, reject) => {
    try {
      const scriptEle = document.createElement("script");
      scriptEle.type = type;
      scriptEle.async = async;
      scriptEle.src = FILE_URL;

      scriptEle.addEventListener("load", (ev) => {
        resolve({ status: true });
      });

      scriptEle.addEventListener("error", (ev) => {
        reject({
          status: false,
          message: `Failed to load the script ＄{FILE_URL}`,
        });
      });

      document.body.appendChild(scriptEle);
    } catch (error) {
      reject(error);
    }
  });
};
/*https://pokernetmap.web.app/
Der vises links til de nyeste tråde ude til højre - vælges 'en af nålene' vises istedet de seneste besøg på sted, med links til trådene.

Det er ikke stylet - mit håb er at jeg kan sende koden til pokernet (måske der sendes en hoodie den anden vej?) så kan den pisgule farve komme på og det kan integreres med forum, så man kan angive pokersted når man skrive indlægget.

Hvis der er nogle tråde med besøg vil jeg gerne indsætte dem (send PB)

Nogle forslag til UI/features?
Jeg tænkte evt. man kunne angive overskud/underskud for hvert besøg - så man ved at vælge et sted kan se hvordan PN har klaret sig der, finansielt historisk :D */
