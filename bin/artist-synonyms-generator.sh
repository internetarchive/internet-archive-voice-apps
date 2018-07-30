#!/bin/bash
#
# Automatic script to create CSV files for Google Assistant and Amazon Alexa artist lists
#
# - Read artists.txt
# - Create artist CSV for Google
# - Create artist CSV for Alexa
#

echo " _______  ______    _______  ___   _______  _______
|   _   ||    _ |  |       ||   | |       ||       |
|  |_|  ||   | ||  |_     _||   | |  _____||_     _|
|       ||   |_||_   |   |  |   | | |_____   |   |
|       ||    __  |  |   |  |   | |_____  |  |   |
|   _   ||   |  | |  |   |  |   |  _____| |  |   |
|__| |__||___|  |_|  |___|  |___| |_______|  |___|
 _______  __   __  __    _  _______  __    _  __   __  __   __
|       ||  | |  ||  |  | ||       ||  |  | ||  | |  ||  |_|  |
|  _____||  |_|  ||   |_| ||   _   ||   |_| ||  |_|  ||       |
| |_____ |       ||       ||  | |  ||       ||       ||       |
|_____  ||_     _||  _    ||  |_|  ||  _    ||_     _||       |
 _____| |  |   |  | | |   ||       || | |   |  |   |  | ||_|| |
|_______|  |___|  |_|  |__||_______||_|  |__|  |___|  |_|   |_|
 _______  _______  __    _  _______  ______    _______  _______  _______  ______
|       ||       ||  |  | ||       ||    _ |  |   _   ||       ||       ||    _ |
|    ___||    ___||   |_| ||    ___||   | ||  |  |_|  ||_     _||   _   ||   | ||
|   | __ |   |___ |       ||   |___ |   |_||_ |       |  |   |  |  | |  ||   |_||_
|   ||  ||    ___||  _    ||    ___||    __  ||       |  |   |  |  |_|  ||    __  |
|   |_| ||   |___ | | |   ||   |___ |   |  | ||   _   |  |   |  |       ||   |  | |
|_______||_______||_|  |__||_______||___|  |_||__| |__|  |___|  |_______||___|  |_|"
echo "Starting now... This should only take a minute or so..."

set -e

checkit='\xE2\x9C\x85'

while :;do echo -n .;sleep 1;done &
trap "kill $!" EXIT  #Die with parent if we die prematurely

#Overwrite current synonym files if they exist
echo -n > alexa-artist-list-with-synonyms.csv
echo -n > google-artist-list-with-synonyms.csv

#While loop to read through each line of artists list
while IFS='' read -r line || [[ -n "$line" ]]; do
    name="$line"
	echo -n $name"," >> alexa-artist-list-with-synonyms.csv
	echo -n "\""$name"\""",""\""$name"\"">> google-artist-list-with-synonyms.csv
	if [[ $name = *" and "* ]]; then
		echo -n ","$name | sed 's/and.*//'>> alexa-artist-list-with-synonyms.csv
		echo -n ",\"">> google-artist-list-with-synonyms.csv
		echo -n $name | sed 's/and.*//'>> google-artist-list-with-synonyms.csv
		echo -n "\"">> google-artist-list-with-synonyms.csv
	fi
	if [[ $name == "The"* ]]; then
		echo -n ","$name | sed 's/The *//'>> alexa-artist-list-with-synonyms.csv
		echo -n ",\"">> google-artist-list-with-synonyms.csv
		echo -n $name | sed 's/The *//'>> google-artist-list-with-synonyms.csv
		echo -n "\"">> google-artist-list-with-synonyms.csv
	fi
	echo >> alexa-artist-list-with-synonyms.csv
	echo >> google-artist-list-with-synonyms.csv
done < "$1"

echo -e "$checkit Created synonym CSV files for Alexa and Assistant"

kill $! && trap " " EXIT #Kill the loop and unset the trap or else the pid might get reassigned and we might end up killing a completely different process
