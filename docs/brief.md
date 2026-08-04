## **Product Brief**

Users currently search for trains through the old interface and often get lost during the selection stage. We need a dedicated train search page.

Around half of all sales come from Google searches such as “Paris to Amsterdam trains,” so the page must load quickly and be indexable by search engines.

Users also share search result links through messaging apps. When another person opens the link, they should see the same search parameters.

The main user flow is:

* select departure and arrival cities;  
* select a date;  
* set a maximum budget, for example €80;  
* sort the results by price;  
* open a train, view its details, and book seats.

The displayed seat availability must be accurate. If there are no longer enough seats, the user should receive a clear message and be able to return to the other options.

Users often compare three or four trains. They should be able to save a train for later, and saved trains should appear at the top of the list.

Accounts and cross-device synchronization are planned for the next quarter, but there is currently no backend support for this feature.

The API is slow and may sometimes be unavailable. Loading and error states should not make the website appear broken.

Around 60% of traffic comes from mobile devices.

## **API**

| Method | Endpoint | Purpose | Possible response |
| ----- | ----- | ----- | ----- |
| `GET` | `/trains?from=&to=&date=&sortBy=&sortOrder=&page=&limit=` | Get the train list | `{ data, total, page, limit }` |
| `GET` | `/trains/:id` | Get one train | `200` — train found, `404` — not found |
| `POST` | `/bookings` | Book seats. Body: `{ trainId, seats? }` | `201` — success, `400` — invalid `trainId`, `409` — not enough seats |
| `GET` | `/stations` | Get the station list | City directory |
| `POST` | `/reset` | Reset seat availability to the initial values | Intended for testing |

**Base URL:**

`https://train-booking-assignment.onrender.com`

The API should not be modified, forked, or run locally. If the API does not provide something required by the brief, make your own decision on how to handle it and document the assumption.

## **Technical Requirements**

Required:

* Next.js;  
* TypeScript;  
* responsive interface.

You may use:

* App Router or Pages Router;  
* any state management solution;  
* any CSS approach.

Maximum completion time: **8 hours**.

## **What to Submit**

### **Repository**

Provide a private repository.

The reviewer should be able to install the project with one command and start it with another.

### **README.md**

Include the following three sections:

**What was implemented**  
Briefly list the completed functionality.

**What was not implemented and why**  
Explain which parts of the brief were deliberately left out and how you prioritized the scope.

**Assumptions**  
Describe anything that was unclear in the brief and how you decided to handle it.

### **AI Agent Logs**

Include a full export of your conversation with the AI agent.
