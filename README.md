# My Money Compass

Build a complete private personal money-tracking web application called "My Money Tracker".

This application is ONLY for my personal record keeping. It is not a banking app, lending marketplace, payment app, or accounting service.

The application must be fully functional with a database, authentication, calculations, transaction history, reminders, search, filtering, editing, deleting, and export.

Use Indian Rupees (₹) throughout the application.

1. CORE PURPOSE

I need to track two completely different situations:

A. MONEY I HAVE TAKEN

This means another person gave me money, so I owe that person the principal.

Example:

Rahul gave me ₹50,000.

I record:

Person: Rahul

Type: Money Taken

Principal: ₹50,000

Date Taken: 10 August 2026

Monthly Extra: ₹1,000

Principal repayment: On demand

The ₹50,000 is the principal I owe Rahul.

B. MONEY I HAVE GIVEN

This means I gave my own money to another person, so that person owes me the principal.

Example:

I gave Priya ₹20,000.

I record:

Person: Priya

Type: Money Given

Principal: ₹20,000

Date Given: 15 August 2026

Monthly Extra: ₹500

Principal repayment: On demand

The ₹20,000 is the principal Priya owes me.

2. VERY IMPORTANT ACCOUNTING RULE

The application MUST keep:

PRINCIPAL

and

MONTHLY EXTRA

completely separate.

Never subtract monthly-extra payments from principal.

Example:

Original Principal: ₹50,000

Monthly Extra: ₹1,000

If I pay the ₹1,000 monthly extra:

Principal Remaining = ₹50,000

Extra Paid = ₹1,000

If I later pay ₹10,000 toward principal:

Principal Remaining = ₹40,000

Extra Paid = ₹1,000

This separation is one of the most important requirements of the entire application.

3. AUTHENTICATION AND PRIVACY

Create a private authenticated application.

Each user's data must be isolated.

Use proper authentication and database security / row-level security.

No financial information should be publicly accessible.

Users must only be able to see their own people, records, and transactions.

4. MAIN NAVIGATION

Create a sidebar on desktop and a suitable mobile navigation.

Navigation:

Dashboard

People

Money Taken

Money Given

Transactions

Reminders

Settings

Add a prominent "+ Add Record" button.

5. DASHBOARD

Create a polished dashboard.

At the top show:

Good evening 👋

and the current date.

Show these summary cards:

Money I Owe

Total remaining principal from all Money Taken records.

Money Owed To Me

Total remaining principal from all Money Given records.

Monthly Extra

Total currently expected monthly extra amount.

Extra Paid

Total monthly-extra payments made.

Also show:

Total principal originally taken

Total principal originally given

Total principal paid

Number of active people

Number of active records

Use clear labels so I can immediately understand which money I owe and which money is owed to me.

6. DASHBOARD MONEY FLOW

Add a simple visual section called:

Money Flow

Show:

Others → Me

for Money Taken.

Show:

Me → Others

for Money Given.

Use different visual treatments for the two directions.

Make it immediately understandable.

7. DASHBOARD UPCOMING PAYMENTS

Create an:

Upcoming Monthly Extras

section.

For every active record that has a monthly extra, show:

Person

Amount

Due date

Status

"Mark as Paid" button

Statuses:

Upcoming

Due Today

Overdue

Paid

Do NOT automatically create payments.

Only create a transaction when I press Mark as Paid or manually record the payment.

8. DASHBOARD PRINCIPAL DEMANDS

Create a section:

Principal Demands

Show records where principal has been demanded.

Display:

Person

Outstanding principal

Demand date

Status

Make demanded principal visually noticeable.

9. PEOPLE PAGE

Create a People page.

Each person should have:

Name

Optional phone number

Optional notes

Total amount I owe them

Total amount they owe me

Number of active records

Allow:

Add Person

Edit Person

Delete Person

Search Person

Open Person Details

A person can have multiple separate money records.

Do NOT merge separate records automatically.

10. ADD PERSON

Create a simple form:

Name — required

Phone — optional

Notes — optional

After saving, open the person's profile.

11. ADD MONEY TAKEN

Create a form titled:

Money Taken From Someone

Fields:

Person

Principal Amount

Date Taken

Monthly Extra Amount

Monthly Extra Start Date

Principal Repayment Condition

Notes

Principal repayment condition:

On Demand

Specific Date

Flexible / No Fixed Date

If "Specific Date" is selected, show a date field.

Default:

On Demand

12. ADD MONEY GIVEN

Create a form titled:

Money Given To Someone

Fields:

Person

Principal Amount

Date Given

Monthly Extra Amount

Monthly Extra Start Date

Principal Repayment Condition

Notes

Principal repayment condition:

On Demand

Specific Date

Flexible / No Fixed Date

Default:

On Demand

13. RECORD PAYMENT

Create a separate button:

Record Payment

When clicked, show:

Payment Type

Principal Payment

Monthly Extra Payment

Other Payment

Fields:

Person

Money Record

Amount

Date

Notes

14. PRINCIPAL PAYMENT

When a principal payment is recorded:

Original Principal
minus
Total Principal Payments
equals
Remaining Principal

Example:

Original = ₹50,000

Payment = ₹10,000

Remaining = ₹40,000

If another ₹5,000 is paid:

Remaining = ₹35,000

Never allow the remaining principal to become negative.

If the payment exceeds the remaining principal, show a confirmation/warning.

15. MONTHLY EXTRA PAYMENT

When a monthly-extra payment is recorded:

It must ONLY increase:

Total Extra Paid

It must NOT reduce:

Remaining Principal

Example:

Principal = ₹50,000

Monthly Extra = ₹1,000

Extra payment = ₹1,000

Result:

Principal Remaining = ₹50,000

Extra Paid = ₹1,000

16. MONTHLY EXTRA REMINDER SYSTEM

For each record with a monthly extra:

Calculate the next expected monthly payment date.

Example:

Start Date: 10 August 2026

Monthly Extra: ₹1,000

Expected dates:

10 September 2026
10 October 2026
10 November 2026

Do not generate actual transactions automatically.

Generate reminders instead.

When I mark one as paid, create the corresponding transaction.

17. PRINCIPAL DEMAND SYSTEM

Each money record should have:

Principal Demand Status

Options:

Not Demanded

Demanded

Partially Paid

Fully Paid

Allow me to click:

Mark Principal as Demanded

Then record:

Demand Date

Optional Note

Show prominently:

PRINCIPAL DEMANDED

and:

Outstanding Principal: ₹XX,XXX

18. PERSON DETAILS PAGE

When I open a person, create a detailed profile.

At the top:

Person Name

Then show all their records separately.

For each record display:

Record Type

Money Taken / Money Given

Original Principal

₹XX,XXX

Remaining Principal

₹XX,XXX

Monthly Extra

₹X,XXX / month

Total Extra Paid

₹X,XXX

Total Principal Paid

₹X,XXX

Start Date

Date

Repayment Condition

On Demand / Specific Date / Flexible

Principal Demand Status

Not Demanded / Demanded / Partially Paid / Fully Paid

19. RECORD HISTORY

Under each record, show a chronological transaction timeline.

Example:

10 Aug 2026
Money Taken

₹50,000

10 Sep 2026
Monthly Extra Paid
₹1,000

10 Oct 2026
Monthly Extra Paid
₹1,000

20 Oct 2026
Principal Payment
₹10,000

Then show:

Original Principal: ₹50,000

Principal Paid: ₹10,000

Remaining Principal: ₹40,000

Extra Paid: ₹2,000

20. MULTIPLE RECORDS PER PERSON

This is extremely important.

The same person can have multiple separate records.

Example:

Rahul

Record 1:
Money Taken
₹50,000
10 August 2026

Record 2:
Money Taken
₹20,000
5 October 2026

Keep these as separate records.

Each record must have its own:

Principal

Monthly extra

Start date

Repayment condition

Demand status

Transactions

Remaining balance

The person's overall profile can show the combined total, but the records themselves must remain separate.

21. MONEY TAKEN PAGE

Create a dedicated Money Taken page.

Show only money that I owe to others.

Columns/cards:

Person

Original Principal

Remaining Principal

Monthly Extra

Start Date

Demand Status

Next Extra Due

Status

Add:

Search
Filters
Sort
Add Money Taken

Filters:

Active

Fully Paid

Principal Demanded

Monthly Extra Due

Overdue

Date Range

22. MONEY GIVEN PAGE

Create a dedicated Money Given page.

Show only money that others owe me.

Columns/cards:

Person

Original Principal

Remaining Principal

Monthly Extra

Start Date

Demand Status

Next Extra Due

Status

Add:

Search
Filters
Sort
Add Money Given

23. TRANSACTIONS PAGE

Create a complete transaction history.

Columns:

Date
Person
Record
Transaction Type
Amount
Direction
Notes

Transaction types:

Principal Payment

Monthly Extra

Other

Adjustment

Allow:

Search

Filter

Sort by date

Sort by amount

Filter by person

Filter by transaction type

Filter by date range

24. CALCULATIONS

Use dynamic calculations.

For Money Taken:

Total I Owe =
sum of remaining principal across active Money Taken records.

For Money Given:

Total Owed To Me =
sum of remaining principal across active Money Given records.

Principal Remaining:

Original Principal - Principal Payments

Extra Paid:

Sum of Monthly Extra transactions

Do not mix these calculations.

25. INDIAN CURRENCY FORMATTING

Use ₹.

Format amounts using Indian numbering when possible.

Examples:

₹1,000

₹10,000

₹1,00,000

₹10,00,000

Do not display dollar signs.

26. SEARCH

Global search should be able to find:

Person

Record

Transaction

Person search should work by name.

27. EDITING

Allow editing:

Person

Money record

Transaction

When editing a financial record, clearly show the current values.

Do not silently change historical transactions.

28. DELETE PROTECTION

Before deleting:

Person

Money record

Transaction

show a confirmation dialog.

For financial records, make the warning clear.

Example:

"This will permanently remove this financial record and its transaction history."

29. EXPORT

Create an Export section in Settings.

Allow export of:

People

Money Records

Transactions

Support CSV.

If practical, also provide a complete backup file.

30. SETTINGS

Settings should include:

Currency

Account/profile

Data export

Backup

Restore

Theme

Logout

Default currency:

₹ INR

31. DESIGN

Use a modern, clean, premium personal-finance dashboard.

Do not make it look like a corporate banking application.

Use:

Clean cards

Rounded corners

Good spacing

Simple icons

Clear typography

Subtle animations

Responsive layout

Mobile-friendly forms

Use a calm professional color system.

Money I owe and money owed to me should be visually distinguishable.

Do not overcrowd the dashboard.

32. MOBILE DESIGN

The application must work properly on phones.

On mobile:

Use bottom navigation or a collapsible sidebar

Make Add Record easily accessible

Make forms comfortable to use

Use cards instead of wide tables where necessary

Keep important balances visible

33. DATABASE

Use a relational database with at least these tables:

PEOPLE

id

user_id

name

phone

notes

created_at

updated_at

MONEY_RECORDS

id

user_id

person_id

type

principal_amount

date_started

monthly_extra_amount

monthly_extra_start_date

principal_repayment_condition

principal_due_date

principal_demand_status

principal_demand_date

notes

created_at

updated_at

TRANSACTIONS

id

user_id

money_record_id

person_id

transaction_type

amount

transaction_date

notes

created_at

Ensure all tables have proper relationships.

Use row-level security so users can only access their own records.

34. VALIDATION

Amounts must be greater than zero.

Required fields must be validated.

Dates must be valid.

Principal payments must not normally exceed remaining principal.

Do not allow negative balances.

Do not automatically reduce principal because of monthly-extra payments.

35. DEMO DATA

Create some demo records so I can see how the application works.

Use:

Rahul

Money Taken:
₹50,000

Date:
10 August 2026

Monthly Extra:
₹1,000

Repayment:
On Demand

And:

Priya

Money Given:
₹20,000

Date:
15 August 2026

Monthly Extra:
₹500

Repayment:
On Demand

Clearly mark demo data so it can be deleted easily.

36. TEST THESE FLOWS

Before considering the application complete, test:

Create a person.

Add Money Taken.

Add Money Given.

Add monthly extra.

Record monthly extra payment.

Verify that principal does NOT decrease.

Record principal payment.

Verify that principal decreases.

Mark principal as demanded.

Verify demand status.

Create two separate records for the same person.

Verify they remain separate.

Verify dashboard totals.

Verify transaction history.

Verify reminders.

Verify search.

Verify filters.

Verify editing.

Verify deletion confirmation.

Verify CSV export.

Verify user data privacy.

37. FINAL UX REQUIREMENT

Make the most common actions extremely easy.

The main Add button should provide:

+ Add Record

Then:

Money Taken From Someone

or

Money Given To Someone

Also provide:

Record Payment

Then:

Principal Payment

or

Monthly Extra Payment

I should be able to add a transaction in only a few clicks.

The application should always make it obvious:

Who?

Did I take money from them or give money to them?

How much principal?

How much principal remains?

How much monthly extra?

How much extra have I already paid?

When did the transaction happen?

Has the principal been demanded?

Build the complete working application now, not just a static design.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rupee-account-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/956c7085-3af2-42f5-9bd0-b7e9ddf15ddc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
