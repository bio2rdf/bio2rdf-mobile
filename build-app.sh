ionic build android
cd platforms/android/ant-build/
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../keystore/bio2rdf.keystore Bio2RDFmobile-debug.apk Bio2RDF
zipalign -v 4 Bio2RDFmobile-debug-unaligned.apk $1

