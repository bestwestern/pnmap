import { useState, useEffect } from "preact/hooks";
import "./app.css";
var w = window.innerWidth;
var h = window.innerHeight;

const supabaseUrl = "https://sucqmfvbeonstichlfik.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Y3FtZnZiZW9uc3RpY2hsZmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzNTkyMDQsImV4cCI6MjAwNzkzNTIwNH0.CiCtIOkNezJkuJ-bfdDT9ssj2knTZwGNzWWOKp5tHww";
const sb = supabase.createClient(supabaseUrl, supabaseKey);
export function App() {
  useEffect(async () => {
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      .then((data) => {
        var map = L.map("map").setView([25, -90], 3);

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
            for (var i = data.length; i--; i > -1) {
              const { lat, long, link, postCreated, profil, place } = data[i];
              const dt = new Date(postCreated);
              L.marker([lat, long])
                .addTo(map)
                .bindPopup(
                  "<b>" +
                    profil +
                    ": " +
                    place +
                    ". " +
                    dt.toLocaleDateString() +
                    "</b><br /><a href='" +
                    link +
                    "'>pokernet-link</a>"
                );
              console.log(data[i]);
            }
          });

        map.on("click", onMapClick);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <>
      <div id="map" style={{ height: h - 20 + "px", width: w - "px" }}>
        ffs
      </div>
    </>
  );
}

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
