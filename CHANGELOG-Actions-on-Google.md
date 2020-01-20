# Changelog of Action of Google Scheme

## v31

- rewired `"play <collection>"` from intent `"in-on-go-music-playback"` to `"music query"` (e.g. _"play unlocked music"_ does't start playback but ask about genre instead)
- `"ask internet archive to help"` for "help" intent

## v30

- distinguish State or Country in media query request `"<city>, <state> <year>"` (e.g. "New York, NY, 2005")

## v29

- remove training phrase "Grateful Dead" without entity extracting

## v28

- add synonym `"unlocked music"` to collections entity `"unlocked recordings"`

## v26

- support phrases: `"play <collection> music"` and `"<collection> music"`

## v22

- fix warnings: replace "Washington" with other cities because now DialogFlow
 stops consider Washington as @sys.geo-city

## v19

- Add support of phrase "Randomly play Christmas Music"

## v16

- remove broken example of sentence "Madison, WI 1973"

## v15

- add support of Unlocked Recordings collection

## v14

- remove some weird phrases from in-one action

## v13

- minor fixes (mainly about song details)

## v11

- new feature: play <year>
