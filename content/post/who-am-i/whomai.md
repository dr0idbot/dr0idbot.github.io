---
title: Who am I?
description:My CTF Journey: A Beginner's Exploration of Cybersecurity
slug: who-am-i
date: 2023-06-10 00:00:00+0000
image: WhoAmI.jpg
categories:
    - Web Security
    - Easy
    - CyberTalents
tags:
    - CyberTalents
    - WebSecurity
    - URL-Encoding 
    - Base64-Encoding
weight: 1       # You can add weight to some posts to override the default sorting (date descending)
---
## Do not Start a fight, you cannot stop it

As promised in my [Welcome Blog](https://www.samuelkatanas.live/p/welcome-Blog/), I have started documenting my journey in cybersecurity, especially about the things I learn through [Capture The Flag](https://en.wikipedia.org/wiki/Capture_the_flag_(cybersecurity)) challenges. In this blog post, I will walk you through a challenge I came across and managed to solve on CyberTalents. Tag along, let's dive into it.

_Disclaimer: The content presented in this article is for educational purposes only and does not endorse or encourage any form of unauthorized access or malicious activity._

### Introduction

This challenge is part of the **Introduction to Cybersecurity (Online)** series and can be found [here](https://cybertalents.com/challenges/web/who-am-i).

### Challenge Description

The challenge description didn't provide much information or hints to work with. All I could salvage from here was that it's a Web Security challenge titled: *Who Am I?* Upon clicking the green "Start Challenge" button, I was presented with a link to a webpage requiring us to input a username and password.

### Observations & Findings

My first attempt was to try a random username and password combination to see if I could trigger an error message. However, the page just loaded and returned to its default outlook, giving me no access. I decided to inspect the page's code, and something interesting showed up:

![login page](whoami0.jpg)

Yes, that's right. The default login credentials for a guest user were left commented in the webpage's code. I immediately tried to sign in with these credentials. Username: _Guest_, Password: _Guest_. Boom, **access granted**. But it seemed like we needed to dig deeper. We were now greeted by a welcome page with greetings for our guest user and a warning message:

![guest page](whoami1.jpg)

Now what? I decided to do a further inspection of the webpage's [cookies](https://www.cloudflare.com/en-gb/learning/privacy/what-are-cookies/), and sure enough, there seemed to be more interesting stuff here.

![cookie inspection](whoami2.jpg)

A cookie was stored that is presumably used to authenticate a user the second time they visit the website. Upon closer examination of the cookie value, I realized that it is a [URL-encoded](https://en.wikipedia.org/wiki/URL_encoding) value. Let's try decoding it. I used an online tool for this challenge called [URL Decode](https://www.urldecoder.org/) and got the decoded string:
```
bG9naW49R3Vlc3Q=
```
This decoded string appeared to be another encoded string, more precisely a [Base64](https://en.wikipedia.org/wiki/Base64) string. I used another online tool called [Base64 Decode](https://www.base64decode.org/) to decode it. The output was:
```
login=Guest
```
A sigh of relief, finally something to work with. My next instinct was to try and create and manipulate a cookie in a similar format with the username as _admin_. I followed these steps:

1. Type the string in a similar format:
```
   login=admin
```
5. Encode the string to Base64 format:
```
   bG9naW49YWRtaW4=
```
9. Encode the Base64 string to URL-encoding format:
```
bG9naW49YWRtaW4%3D
```
**Note that I used the same websites mentioned earlier to encode the strings.**

### Solution/Flag

Now that we have our authentication cookie value for the admin user, let's try pasting it in place of the guest user and see if we trigger a different behavior on our target webpage. 
**Hooray!!** 
After pasting and refreshing the webpage, we are now greeted by a welcome page with greetings for our admin user and a congratulatory message with the flag text just below it.

### Conclusion

I have to say, this was an easy challenge, even for a beginner like me. What I find hard is doing a write-up for the challenge on this blog, but again, I enjoy learning and sharing new stuff that I learn in this journey. Happy Hacking. PapaB3ar out.
