{\rtf1\ansi\ansicpg1252\cocoartf1348\cocoasubrtf170
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;\red52\green52\blue52;\red18\green0\blue192;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural

\f0\fs24 \cf0 API Documentation for Native App\
\
Our app will have a page (explore channels) which shows a list of all our channels. This list must be fetched from our database.\
\
method: POST\
path: /api/v1/rooms\
\
 It is also important that we only return channels that are set to live:\
\
\pard\pardeftab720

\fs32 \cf2 \expnd0\expndtw0\kerning0
"\cf0 \expnd0\expndtw0\kerning0
is_live\cf2 \expnd0\expndtw0\kerning0
":\'a0
\b \cf3 \expnd0\expndtw0\kerning0
true
\b0 \cf2 \expnd0\expndtw0\kerning0
,
\fs24 \cf0 \kerning1\expnd0\expndtw0 \
}