package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

/////////////////////////////logging////////////////////////
var loggingDateFormat = "2006.01.2 Monday 15:04:05.0000 MST"
var loggingFileDateFormat = "2006_01_02___15_04_05_MST"

var PROJECT_DIR, _ = filepath.Abs("../../")
var logsDirPath = PROJECT_DIR + "/src/main/logs/"
var loggingPath = logsDirPath + "logs_" + time.Now().Format(loggingFileDateFormat)
var loggingFile *os.File
var loggingFileError error

func logRequest(r *http.Request) {
	fmt.Fprintf(loggingFile, "================REQUEST================\n")
	fmt.Fprintf(loggingFile, "Host: %s\n", r.Host)
	fmt.Fprintf(loggingFile, "Method: %s\n", r.Method)
	fmt.Fprintf(loggingFile, "Protocol: %s\n", r.Proto)
	fmt.Fprintf(loggingFile, "Request URI: %s\n", r.RequestURI)
	fmt.Fprintf(loggingFile, "URL: %s\n", r.URL)
	fmt.Fprintf(loggingFile, "Sender address: %s\n", r.RemoteAddr)
	fmt.Fprintf(loggingFile, "Time: %s\n", time.Now().Format(loggingDateFormat))
	fmt.Fprintf(loggingFile, "=======================================\n\n")
}

func logFileRequest(r *http.Request, filepath string) {
	fmt.Fprintf(loggingFile, "==============FILE REQUEST==============\n")
	fmt.Fprintf(loggingFile, "Host: %s\n", r.Host)
	fmt.Fprintf(loggingFile, "Protocol: %s\n", r.Proto)
	fmt.Fprintf(loggingFile, "Request URI: %s\n", r.RequestURI)
	fmt.Fprintf(loggingFile, "URL: %s\n", r.URL)
	fmt.Fprintf(loggingFile, "Filepath: %s\n", filepath)
	fmt.Fprintf(loggingFile, "Sender address: %s\n", r.RemoteAddr)
	fmt.Fprintf(loggingFile, "Time: %s\n", time.Now().Format(loggingDateFormat))
	fmt.Fprintf(loggingFile, "========================================\n\n")
}

func logError(err error) {
	fmt.Fprintf(loggingFile, "=================ERROR=================\n")
	fmt.Fprintf(loggingFile, "Error: %s\n", err.Error())
	fmt.Fprintf(loggingFile, "Time: %s\n", time.Now().Format(loggingDateFormat))
	fmt.Fprintf(loggingFile, "=======================================\n\n")
}

func logFileRead(err error, filepath string) {
	fmt.Fprintf(loggingFile, "===============FILE READ===============\n")
	fmt.Fprintf(loggingFile, "Filepath: %s\n", filepath)
	fmt.Fprintf(loggingFile, "End cause: %s\n", err.Error())
	fmt.Fprintf(loggingFile, "Time: %s\n", time.Now().Format(loggingDateFormat))
	fmt.Fprintf(loggingFile, "=======================================\n\n")
}

////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
/////////////////////Proxymap////////////////////////////

var proxyMap map[string]string = make(map[string]string)

func initProxymap() {
	proxyMap["/"] = "/index"
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////HandleFileRequest////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
func getType(path string) string {
	var parts = strings.Split(path, ".")
	var l = len(parts)
	if l == 0 || l == 1 {
		return "text/html"
	}
	var extension = parts[l-1]
	if extension == "js" {
		return "application/javascript"
	}
	if extension == "css" {
		return "text/css"
	}
	if extension == "html" {
		return "text/html"
	}
	return "text/plain"
}

const basePath = "../../../arrearsPages/static"

func handleFileRequest(w http.ResponseWriter, relpath string, r *http.Request) {
	var path = basePath + relpath
	var staticPath, _ = filepath.Abs(path)
	fmt.Printf("Path: %s\n", staticPath)
	logFileRequest(r, staticPath)

	var file, err = os.Open(staticPath)
	if err != nil {
		fmt.Println(err.Error())
		logError(err)
		http.NotFound(w, r)
		file.Close()
		return
	}

	var data = make([]byte, 1024)
	var typeStr = getType(relpath)
	w.Header().Set("Content-Type", typeStr+"; charset=utf-8")
	for {
		var l, err = file.Read(data)
		fmt.Fprint(w, string(data[:l]))
		if err != nil {
			fmt.Println(err)
			logFileRead(err, staticPath)
			break
		}
	}
	file.Close()
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		return
	}

	var relpath = proxyMap[r.URL.String()]
	if relpath == "" {
		relpath = r.URL.String()
	}

	handleFileRequest(w, relpath, r)
}

const (
	PROTOCOL = "https://"
	DOMAIN   = "localhost"
	PORT     = ":443"
)

func redirectHandler(w http.ResponseWriter, r *http.Request) {
	var redirectPath = PROTOCOL + DOMAIN + PORT + r.RequestURI
	http.Redirect(w, r, redirectPath, http.StatusMovedPermanently)
}

const (
	HTTP_PORT  = ":80"
	HTTPS_PORT = ":443"
)

func main() {
	loggingFile, loggingFileError = os.Create(loggingPath)
	if loggingFileError != nil {
		fmt.Println(loggingFileError)
		os.Exit(1)
	}
	initProxymap()
	/*
			var manager = &autocert.Manager{
				Cache:      autocert.DirCache("keys-dir"),
				Prompt:     autocert.AcceptTOS,
				Email:      "example@example.org",
				HostPolicy: autocert.HostWhitelist("5.44.41.208", "ocirtyv.ru"),
			}

		var server = &http.Server{
			Addr: SERVICE_PORT,
			//TLSConfig: manager.TLSConfig(),
			Handler: http.HandlerFunc(handler),
		}

	*/
	go func() {
		http.ListenAndServe(HTTP_PORT, http.HandlerFunc(redirectHandler))
	}()

	http.HandleFunc("/", handler)
	//http.ListenAndServe(HTTP_PORT, nil)
	http.ListenAndServeTLS(HTTPS_PORT, "../../https/localhost.crt", "../../https/localhost.key", nil)
}
